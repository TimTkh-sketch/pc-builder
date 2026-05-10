from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey,
    DateTime, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class CategorySlug(str, enum.Enum):
    cpu = "cpu"
    motherboard = "motherboard"
    ram = "ram"
    gpu = "gpu"
    storage = "storage"
    psu = "psu"
    case = "case"
    cooler = "cooler"
    monitor = "monitor"
    keyboard = "keyboard"
    mouse = "mouse"


class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    country = Column(String(100))
    website = Column(String(255))

    components = relationship("Component", back_populates="manufacturer")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(SAEnum(CategorySlug), unique=True, nullable=False)
    description = Column(Text)

    components = relationship("Component", back_populates="category")


class Component(Base):
    """Base component table — 3NF: every non-key attribute depends only on PK."""
    __tablename__ = "components"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    model = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id"), nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    release_year = Column(Integer)

    category = relationship("Category", back_populates="components")
    manufacturer = relationship("Manufacturer", back_populates="components")
    prices = relationship("Price", back_populates="component", cascade="all, delete-orphan")
    cpu = relationship("CPU", back_populates="component", uselist=False, cascade="all, delete-orphan")
    motherboard = relationship("Motherboard", back_populates="component", uselist=False, cascade="all, delete-orphan")
    ram = relationship("RAM", back_populates="component", uselist=False, cascade="all, delete-orphan")
    gpu = relationship("GPU", back_populates="component", uselist=False, cascade="all, delete-orphan")
    storage = relationship("Storage", back_populates="component", uselist=False, cascade="all, delete-orphan")
    psu = relationship("PSU", back_populates="component", uselist=False, cascade="all, delete-orphan")
    case = relationship("Case", back_populates="component", uselist=False, cascade="all, delete-orphan")
    cooler = relationship("Cooler", back_populates="component", uselist=False, cascade="all, delete-orphan")
    monitor = relationship("Monitor", back_populates="component", uselist=False, cascade="all, delete-orphan")
    keyboard = relationship("Keyboard", back_populates="component", uselist=False, cascade="all, delete-orphan")
    mouse = relationship("Mouse", back_populates="component", uselist=False, cascade="all, delete-orphan")
    build_components = relationship("BuildComponent", back_populates="component")


class CPU(Base):
    __tablename__ = "cpus"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    socket = Column(String(50), nullable=False)
    cores = Column(Integer, nullable=False)
    threads = Column(Integer, nullable=False)
    base_freq_ghz = Column(Float, nullable=False)
    boost_freq_ghz = Column(Float)
    tdp_w = Column(Integer, nullable=False)
    memory_type = Column(String(20), nullable=False)  # DDR4, DDR5
    integrated_graphics = Column(Boolean, default=False)
    l3_cache_mb = Column(Float)

    component = relationship("Component", back_populates="cpu")


class Motherboard(Base):
    __tablename__ = "motherboards"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    socket = Column(String(50), nullable=False)
    chipset = Column(String(50), nullable=False)
    form_factor = Column(String(20), nullable=False)  # ATX, mATX, ITX
    ram_slots = Column(Integer, nullable=False)
    max_ram_gb = Column(Integer, nullable=False)
    ram_type = Column(String(20), nullable=False)  # DDR4, DDR5
    max_ram_speed_mhz = Column(Integer)
    pcie_slots = Column(Integer)
    m2_slots = Column(Integer)
    sata_ports = Column(Integer)

    component = relationship("Component", back_populates="motherboard")


class RAM(Base):
    __tablename__ = "ram_modules"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    ram_type = Column(String(20), nullable=False)  # DDR4, DDR5
    capacity_gb = Column(Integer, nullable=False)
    speed_mhz = Column(Integer, nullable=False)
    modules_count = Column(Integer, nullable=False, default=1)
    cas_latency = Column(Integer)
    voltage_v = Column(Float)

    component = relationship("Component", back_populates="ram")


class GPU(Base):
    __tablename__ = "gpus"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    vram_gb = Column(Integer, nullable=False)
    vram_type = Column(String(20))  # GDDR6, GDDR6X
    tdp_w = Column(Integer, nullable=False)
    length_mm = Column(Integer)
    pcie_version = Column(String(30))
    power_connectors = Column(String(50))
    cuda_cores = Column(Integer)
    recommended_psu_w = Column(Integer)

    component = relationship("Component", back_populates="gpu")


class Storage(Base):
    __tablename__ = "storage_devices"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    storage_type = Column(String(20), nullable=False)  # SSD, HDD, NVMe
    interface = Column(String(20), nullable=False)   # SATA, M.2 NVMe, M.2 SATA
    capacity_gb = Column(Integer, nullable=False)
    read_speed_mbs = Column(Integer)
    write_speed_mbs = Column(Integer)
    form_factor = Column(String(20))  # 2.5", 3.5", M.2 2280

    component = relationship("Component", back_populates="storage")


class PSU(Base):
    __tablename__ = "psus"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    wattage = Column(Integer, nullable=False)
    efficiency_rating = Column(String(20))  # 80+ Bronze, Gold, Platinum
    modular = Column(String(20))  # Full, Semi, Non-modular
    form_factor = Column(String(20))  # ATX, SFX

    component = relationship("Component", back_populates="psu")


class Case(Base):
    __tablename__ = "cases"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    form_factor = Column(String(20), nullable=False)   # ATX, mATX, ITX
    max_gpu_length_mm = Column(Integer)
    max_cooler_height_mm = Column(Integer)
    drive_bays_35 = Column(Integer)
    drive_bays_25 = Column(Integer)
    usb_ports = Column(String(100))

    component = relationship("Component", back_populates="case")


class Cooler(Base):
    __tablename__ = "coolers"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    cooler_type = Column(String(20))  # Air, AIO 240, AIO 360
    height_mm = Column(Integer)
    tdp_rating_w = Column(Integer)
    fan_size_mm = Column(Integer)
    supported_sockets = Column(String(200), nullable=False)  # comma-separated

    component = relationship("Component", back_populates="cooler")


class Monitor(Base):
    __tablename__ = "monitors"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    panel_type = Column(String(20))        # IPS, VA, TN, OLED
    resolution = Column(String(20))        # 1920x1080, 2560x1440, 3840x2160
    refresh_rate_hz = Column(Integer)
    response_time_ms = Column(Float)
    size_inch = Column(Float)
    hdr = Column(Boolean, default=False)
    freesync = Column(Boolean, default=False)
    gsync = Column(Boolean, default=False)
    connectors = Column(String(100))       # "HDMI 2.1, DisplayPort 1.4"
    curved = Column(Boolean, default=False)

    component = relationship("Component", back_populates="monitor")


class Keyboard(Base):
    __tablename__ = "keyboards"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    kb_type = Column(String(20))           # Mechanical, Membrane
    switch_type = Column(String(50))       # "Cherry MX Red", "Razer Yellow"
    layout = Column(String(20))            # Full, TKL, 60%, 75%
    wireless = Column(Boolean, default=False)
    rgb = Column(Boolean, default=False)
    connector = Column(String(30))         # USB-C, USB-A, Wireless 2.4GHz

    component = relationship("Component", back_populates="keyboard")


class Mouse(Base):
    __tablename__ = "mice"

    component_id = Column(Integer, ForeignKey("components.id"), primary_key=True)
    max_dpi = Column(Integer)
    sensor = Column(String(50))
    buttons = Column(Integer)
    wireless = Column(Boolean, default=False)
    rgb = Column(Boolean, default=False)
    weight_g = Column(Integer)
    polling_rate_hz = Column(Integer)

    component = relationship("Component", back_populates="mouse")


class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    store_name = Column(String(100), nullable=False)
    price_rub = Column(Float, nullable=False)
    url = Column(String(500))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    component = relationship("Component", back_populates="prices")
