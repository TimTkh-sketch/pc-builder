from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from app.database import get_db
from app.models.component import Component, Category, Price
from app.schemas.component import ComponentDetail, ComponentList
from app.services.compatibility import derive_constraints, is_compatible_with

router = APIRouter(prefix="/components", tags=["components"])


def _component_to_detail(c: Component) -> ComponentDetail:
    min_price = min((p.price_rub for p in c.prices), default=None)
    return ComponentDetail(
        id=c.id,
        name=c.name,
        model=c.model,
        category_slug=c.category.slug.value,
        category_name=c.category.name,
        manufacturer_name=c.manufacturer.name,
        description=c.description,
        image_url=c.image_url,
        release_year=c.release_year,
        min_price=min_price,
        prices=c.prices,
        cpu=c.cpu,
        motherboard=c.motherboard,
        ram=c.ram,
        gpu=c.gpu,
        storage=c.storage,
        psu=c.psu,
        case=c.case,
        cooler=c.cooler,
        monitor=c.monitor,
        keyboard=c.keyboard,
        mouse=c.mouse,
    )


def _load_options():
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
        selectinload(Component.monitor),
        selectinload(Component.keyboard),
        selectinload(Component.mouse),
    ]


@router.get("/categories/list")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug.value} for c in cats]


@router.get("/", response_model=list[ComponentList])
def list_components(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    manufacturer: Optional[str] = Query(None),
    build_ids: Optional[str] = Query(None, description="Comma-separated component IDs of the active build"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    # ── Derive constraints from the active build ────────────────────────────
    constraints: dict = {}
    if build_ids:
        ids = [int(x) for x in build_ids.split(",") if x.strip().isdigit()]
        if ids:
            build_comps = (
                db.query(Component)
                .options(*_load_options())
                .filter(Component.id.in_(ids))
                .all()
            )
            constraints = derive_constraints(build_comps)

    # ── Query ───────────────────────────────────────────────────────────────
    q = (
        db.query(Component)
        .options(*_load_options())
        .join(Component.category)
        .join(Component.manufacturer)
    )

    if category:
        q = q.filter(Category.slug == category)
    if search:
        pattern = f"%{search}%"
        q = q.filter(Component.name.ilike(pattern) | Component.model.ilike(pattern))
    if manufacturer:
        from app.models.component import Manufacturer
        q = q.filter(Manufacturer.name.ilike(f"%{manufacturer}%"))
    if min_price is not None or max_price is not None:
        q = q.join(Component.prices)
        if min_price is not None:
            q = q.filter(Price.price_rub >= min_price)
        if max_price is not None:
            q = q.filter(Price.price_rub <= max_price)

    components = q.offset(offset).limit(limit).all()

    result = []
    for c in components:
        min_p = min((p.price_rub for p in c.prices), default=None)
        compatible = is_compatible_with(c, constraints) if constraints else None
        result.append(
            ComponentList(
                id=c.id,
                name=c.name,
                model=c.model,
                category_slug=c.category.slug.value,
                manufacturer_name=c.manufacturer.name,
                min_price=min_p,
                image_url=c.image_url,
                compatible=compatible,
            )
        )
    return result


@router.get("/manufacturers/list")
def list_manufacturers(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    from app.models.component import Manufacturer
    q = db.query(Manufacturer.name).join(Component, Component.manufacturer_id == Manufacturer.id)
    if category:
        q = q.join(Component.category).filter(Category.slug == category)
    names = sorted({row[0] for row in q.all()})
    return names


@router.get("/{component_id}", response_model=ComponentDetail)
def get_component(component_id: int, db: Session = Depends(get_db)):
    c = (
        db.query(Component)
        .options(*_load_options())
        .filter(Component.id == component_id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Компонент не найден")
    return _component_to_detail(c)
