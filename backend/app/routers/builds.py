from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from app.database import get_db
from app.models.build import Build, BuildComponent
from app.models.component import Component
from app.schemas.build import BuildCreate, BuildOut, BuildDetail
from app.services.compatibility import check_compatibility, calculate_total_tdp
from app.routers.components import _component_to_detail, _load_options

router = APIRouter(prefix="/builds", tags=["builds"])


def _load_build(db: Session, build_id: int) -> Build | None:
    return (
        db.query(Build)
        .options(selectinload(Build.build_components).selectinload(BuildComponent.component))
        .filter(Build.id == build_id)
        .first()
    )


def _build_components(build: Build, db: Session) -> list[Component]:
    ids = [bc.component_id for bc in build.build_components]
    if not ids:
        return []
    return (
        db.query(Component)
        .options(*_load_options())
        .filter(Component.id.in_(ids))
        .all()
    )


def _to_build_out(b: Build, components: list[Component]) -> BuildOut:
    total_price = sum(
        min((p.price_rub for p in c.prices), default=0) for c in components
    ) or None
    return BuildOut(
        id=b.id, name=b.name, description=b.description, author=b.author,
        is_preset=b.is_preset, purpose=b.purpose, tier=b.tier,
        created_at=b.created_at, total_price=total_price,
        components_count=len(components),
    )


@router.get("/", response_model=list[BuildOut])
def list_builds(
    preset: Optional[bool] = Query(None, description="Filter preset builds"),
    purpose: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Build).options(selectinload(Build.build_components))
    if preset is not None:
        q = q.filter(Build.is_preset == preset)
    if purpose:
        q = q.filter(Build.purpose == purpose)
    builds = q.order_by(Build.id).all()
    result = []
    for b in builds:
        components = _build_components(b, db)
        result.append(_to_build_out(b, components))
    return result


@router.post("/", response_model=BuildOut, status_code=201)
def create_build(data: BuildCreate, db: Session = Depends(get_db)):
    build = Build(name=data.name, description=data.description, author=data.author)
    db.add(build)
    db.flush()
    for cid in data.component_ids:
        c = db.query(Component).filter(Component.id == cid).first()
        if not c:
            raise HTTPException(status_code=404, detail=f"Компонент {cid} не найден")
        db.add(BuildComponent(build_id=build.id, component_id=cid))
    db.commit()
    db.refresh(build)
    components = _build_components(build, db)
    return _to_build_out(build, components)


@router.get("/{build_id}", response_model=BuildDetail)
def get_build(build_id: int, db: Session = Depends(get_db)):
    build = _load_build(db, build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Сборка не найдена")
    components = _build_components(build, db)
    issues = check_compatibility(components)
    total_tdp = calculate_total_tdp(components)
    total_price = sum(
        min((p.price_rub for p in c.prices), default=0) for c in components
    ) or None
    return BuildDetail(
        id=build.id, name=build.name, description=build.description,
        author=build.author, is_preset=build.is_preset,
        purpose=build.purpose, tier=build.tier,
        created_at=build.created_at, total_price=total_price,
        components_count=len(components),
        components=[_component_to_detail(c) for c in components],
        compatibility_issues=issues, total_tdp=total_tdp,
    )


@router.delete("/{build_id}", status_code=204)
def delete_build(build_id: int, db: Session = Depends(get_db)):
    build = db.query(Build).filter(Build.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Сборка не найдена")
    db.delete(build)
    db.commit()


@router.post("/{build_id}/components/{component_id}", response_model=BuildDetail)
def add_component_to_build(build_id: int, component_id: int, db: Session = Depends(get_db)):
    build = _load_build(db, build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Сборка не найдена")
    c = db.query(Component).filter(Component.id == component_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Компонент не найден")
    existing = {bc.component_id for bc in build.build_components}
    if component_id not in existing:
        db.add(BuildComponent(build_id=build_id, component_id=component_id))
        db.commit()
    return get_build(build_id, db)


@router.delete("/{build_id}/components/{component_id}", response_model=BuildDetail)
def remove_component_from_build(build_id: int, component_id: int, db: Session = Depends(get_db)):
    bc = (
        db.query(BuildComponent)
        .filter(BuildComponent.build_id == build_id, BuildComponent.component_id == component_id)
        .first()
    )
    if bc:
        db.delete(bc)
        db.commit()
    return get_build(build_id, db)
