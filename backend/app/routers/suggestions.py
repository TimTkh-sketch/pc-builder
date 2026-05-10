from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, selectinload
from app.database import get_db
from app.models.component import Component, Category, CategorySlug
from app.schemas.component import ComponentList

router = APIRouter(prefix="/suggestions", tags=["suggestions"])


def _load_opts():
    return [
        selectinload(Component.category),
        selectinload(Component.manufacturer),
        selectinload(Component.prices),
        selectinload(Component.cpu),
        selectinload(Component.motherboard),
        selectinload(Component.ram),
        selectinload(Component.gpu),
        selectinload(Component.storage),
        selectinload(Component.psu),
        selectinload(Component.case),
        selectinload(Component.cooler),
    ]


def _to_list(c: Component) -> ComponentList:
    min_p = min((p.price_rub for p in c.prices), default=None)
    return ComponentList(
        id=c.id,
        name=c.name,
        model=c.model,
        category_slug=c.category.slug.value,
        manufacturer_name=c.manufacturer.name,
        min_price=min_p,
        image_url=c.image_url,
    )


@router.get("/", response_model=dict)
def get_suggestions(
    component_ids: str = Query("", description="Comma-separated component IDs in current build"),
    db: Session = Depends(get_db),
):
    """
    Returns compatible component suggestions for each unfilled category slot,
    based on the components already selected.
    """
    ids = [int(x) for x in component_ids.split(",") if x.strip().isdigit()]

    selected: list[Component] = []
    if ids:
        selected = (
            db.query(Component)
            .options(*_load_opts())
            .filter(Component.id.in_(ids))
            .all()
        )

    by_cat = {c.category.slug.value: c for c in selected if c.category}

    cpu = by_cat.get("cpu")
    mb  = by_cat.get("motherboard")
    ram = by_cat.get("ram")

    hints: dict[str, list] = {}
    messages: list[str] = []

    # ── CPU → Motherboard ────────────────────────────────────────────────────
    if cpu and not mb:
        socket = cpu.cpu.socket if cpu.cpu else None
        if socket:
            qs = (
                db.query(Component)
                .options(*_load_opts())
                .join(Component.category)
                .filter(Category.slug == CategorySlug.motherboard)
            )
            candidates = [
                c for c in qs.all()
                if c.motherboard and c.motherboard.socket == socket
                   and c.id not in ids
            ]
            hints["motherboard"] = [_to_list(c) for c in candidates[:4]]
            if candidates:
                messages.append(
                    f"Для CPU с сокетом {socket} подойдут эти материнские платы:"
                )

    # ── Motherboard → CPU ────────────────────────────────────────────────────
    if mb and not cpu:
        socket = mb.motherboard.socket if mb.motherboard else None
        if socket:
            qs = (
                db.query(Component)
                .options(*_load_opts())
                .join(Component.category)
                .filter(Category.slug == CategorySlug.cpu)
            )
            candidates = [
                c for c in qs.all()
                if c.cpu and c.cpu.socket == socket
                   and c.id not in ids
            ]
            hints["cpu"] = [_to_list(c) for c in candidates[:4]]
            if candidates:
                messages.append(
                    f"Для материнской платы с сокетом {socket} подойдут эти процессоры:"
                )

    # ── MB → RAM (by type) ───────────────────────────────────────────────────
    if mb and not ram:
        ram_type = mb.motherboard.ram_type if mb.motherboard else None
        if ram_type:
            qs = (
                db.query(Component)
                .options(*_load_opts())
                .join(Component.category)
                .filter(Category.slug == CategorySlug.ram)
            )
            candidates = [
                c for c in qs.all()
                if c.ram and c.ram.ram_type == ram_type
                   and c.id not in ids
            ]
            hints["ram"] = [_to_list(c) for c in candidates[:4]]
            if candidates:
                messages.append(
                    f"Материнская плата поддерживает {ram_type} — рекомендуемые модули:"
                )

    # ── CPU → RAM (by memory_type, when no MB yet) ───────────────────────────
    if cpu and not mb and not ram:
        mem_type = cpu.cpu.memory_type if cpu.cpu else None
        if mem_type and "ram" not in hints:
            qs = (
                db.query(Component)
                .options(*_load_opts())
                .join(Component.category)
                .filter(Category.slug == CategorySlug.ram)
            )
            candidates = [
                c for c in qs.all()
                if c.ram and c.ram.ram_type == mem_type
                   and c.id not in ids
            ]
            hints["ram"] = [_to_list(c) for c in candidates[:4]]
            if candidates:
                messages.append(
                    f"CPU поддерживает {mem_type} — совместимые модули памяти:"
                )

    # ── GPU+CPU → PSU ────────────────────────────────────────────────────────
    gpu = by_cat.get("gpu")
    psu = by_cat.get("psu")
    if (cpu or gpu) and not psu:
        needed = 100  # base headroom
        if cpu and cpu.cpu:
            needed += cpu.cpu.tdp_w
        if gpu and gpu.gpu:
            needed += gpu.gpu.tdp_w
        if needed > 100:
            qs = (
                db.query(Component)
                .options(*_load_opts())
                .join(Component.category)
                .filter(Category.slug == CategorySlug.psu)
            )
            candidates = [
                c for c in qs.all()
                if c.psu and c.psu.wattage >= needed
                   and c.id not in ids
            ]
            candidates.sort(key=lambda c: c.psu.wattage)
            hints["psu"] = [_to_list(c) for c in candidates[:4]]
            if candidates:
                messages.append(
                    f"Для выбранных компонентов нужен БП от {needed} Вт:"
                )

    # ── Suggest missing essential slots ─────────────────────────────────────
    missing_slots = []
    for slug in ("cpu", "motherboard", "ram", "gpu", "psu", "storage", "case", "cooler"):
        if slug not in by_cat and slug not in hints:
            missing_slots.append(slug)

    return {
        "hints": hints,
        "messages": messages,
        "missing_slots": missing_slots,
    }
