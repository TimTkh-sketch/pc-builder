from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PriceOut(BaseModel):
    id: int
    store_name: str
    price_rub: float
    url: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class CPUSpec(BaseModel):
    socket: str
    cores: int
    threads: int
    base_freq_ghz: float
    boost_freq_ghz: Optional[float] = None
    tdp_w: int
    memory_type: str
    integrated_graphics: bool
    l3_cache_mb: Optional[float] = None

    model_config = {"from_attributes": True}


class MotherboardSpec(BaseModel):
    socket: str
    chipset: str
    form_factor: str
    ram_slots: int
    max_ram_gb: int
    ram_type: str
    max_ram_speed_mhz: Optional[int] = None
    pcie_slots: Optional[int] = None
    m2_slots: Optional[int] = None
    sata_ports: Optional[int] = None

    model_config = {"from_attributes": True}


class RAMSpec(BaseModel):
    ram_type: str
    capacity_gb: int
    speed_mhz: int
    modules_count: int
    cas_latency: Optional[int] = None
    voltage_v: Optional[float] = None

    model_config = {"from_attributes": True}


class GPUSpec(BaseModel):
    vram_gb: int
    vram_type: Optional[str] = None
    tdp_w: int
    length_mm: Optional[int] = None
    pcie_version: Optional[str] = None
    power_connectors: Optional[str] = None
    cuda_cores: Optional[int] = None
    recommended_psu_w: Optional[int] = None

    model_config = {"from_attributes": True}


class StorageSpec(BaseModel):
    storage_type: str
    interface: str
    capacity_gb: int
    read_speed_mbs: Optional[int] = None
    write_speed_mbs: Optional[int] = None
    form_factor: Optional[str] = None

    model_config = {"from_attributes": True}


class PSUSpec(BaseModel):
    wattage: int
    efficiency_rating: Optional[str] = None
    modular: Optional[str] = None
    form_factor: Optional[str] = None

    model_config = {"from_attributes": True}


class CaseSpec(BaseModel):
    form_factor: str
    max_gpu_length_mm: Optional[int] = None
    max_cooler_height_mm: Optional[int] = None
    drive_bays_35: Optional[int] = None
    drive_bays_25: Optional[int] = None
    usb_ports: Optional[str] = None

    model_config = {"from_attributes": True}


class CoolerSpec(BaseModel):
    cooler_type: Optional[str] = None
    height_mm: Optional[int] = None
    tdp_rating_w: Optional[int] = None
    fan_size_mm: Optional[int] = None
    supported_sockets: str

    model_config = {"from_attributes": True}


class MonitorSpec(BaseModel):
    panel_type: Optional[str] = None
    resolution: Optional[str] = None
    refresh_rate_hz: Optional[int] = None
    response_time_ms: Optional[float] = None
    size_inch: Optional[float] = None
    hdr: bool = False
    freesync: bool = False
    gsync: bool = False
    connectors: Optional[str] = None
    curved: bool = False

    model_config = {"from_attributes": True}


class KeyboardSpec(BaseModel):
    kb_type: Optional[str] = None
    switch_type: Optional[str] = None
    layout: Optional[str] = None
    wireless: bool = False
    rgb: bool = False
    connector: Optional[str] = None

    model_config = {"from_attributes": True}


class MouseSpec(BaseModel):
    max_dpi: Optional[int] = None
    sensor: Optional[str] = None
    buttons: Optional[int] = None
    wireless: bool = False
    rgb: bool = False
    weight_g: Optional[int] = None
    polling_rate_hz: Optional[int] = None

    model_config = {"from_attributes": True}


class ComponentBase(BaseModel):
    id: int
    name: str
    model: str
    category_slug: str
    category_name: str
    manufacturer_name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    release_year: Optional[int] = None
    min_price: Optional[float] = None
    prices: list[PriceOut] = []

    model_config = {"from_attributes": True}


class ComponentList(BaseModel):
    id: int
    name: str
    model: str
    category_slug: str
    manufacturer_name: str
    min_price: Optional[float] = None
    image_url: Optional[str] = None
    compatible: Optional[bool] = None  # None = no active build / unknown

    model_config = {"from_attributes": True}


class ComponentDetail(ComponentBase):
    cpu: Optional[CPUSpec] = None
    motherboard: Optional[MotherboardSpec] = None
    ram: Optional[RAMSpec] = None
    gpu: Optional[GPUSpec] = None
    storage: Optional[StorageSpec] = None
    psu: Optional[PSUSpec] = None
    case: Optional[CaseSpec] = None
    cooler: Optional[CoolerSpec] = None
    monitor: Optional[MonitorSpec] = None
    keyboard: Optional[KeyboardSpec] = None
    mouse: Optional[MouseSpec] = None

    model_config = {"from_attributes": True}
