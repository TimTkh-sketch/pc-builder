from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Build(Base):
    __tablename__ = "builds"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    author = Column(String(100))
    is_preset = Column(Boolean, default=False, nullable=False)
    purpose = Column(String(50))   # gaming, workstation, office, streaming, budget
    tier = Column(String(20))      # budget, mid, high, ultra
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    build_components = relationship(
        "BuildComponent", back_populates="build", cascade="all, delete-orphan"
    )


class BuildComponent(Base):
    __tablename__ = "build_components"

    id = Column(Integer, primary_key=True)
    build_id = Column(Integer, ForeignKey("builds.id"), nullable=False)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)

    build = relationship("Build", back_populates="build_components")
    component = relationship("Component", back_populates="build_components")
