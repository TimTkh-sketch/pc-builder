export interface Price {
  id: number;
  store_name: string;
  price_rub: number;
  url: string | null;
  updated_at: string;
}

export interface CPUSpec {
  socket: string;
  cores: number;
  threads: number;
  base_freq_ghz: number;
  boost_freq_ghz: number | null;
  tdp_w: number;
  memory_type: string;
  integrated_graphics: boolean;
  l3_cache_mb: number | null;
}

export interface MotherboardSpec {
  socket: string;
  chipset: string;
  form_factor: string;
  ram_slots: number;
  max_ram_gb: number;
  ram_type: string;
  max_ram_speed_mhz: number | null;
  pcie_slots: number | null;
  m2_slots: number | null;
  sata_ports: number | null;
}

export interface RAMSpec {
  ram_type: string;
  capacity_gb: number;
  speed_mhz: number;
  modules_count: number;
  cas_latency: number | null;
  voltage_v: number | null;
}

export interface GPUSpec {
  vram_gb: number;
  vram_type: string | null;
  tdp_w: number;
  length_mm: number | null;
  pcie_version: string | null;
  power_connectors: string | null;
  cuda_cores: number | null;
  recommended_psu_w: number | null;
}

export interface StorageSpec {
  storage_type: string;
  interface: string;
  capacity_gb: number;
  read_speed_mbs: number | null;
  write_speed_mbs: number | null;
  form_factor: string | null;
}

export interface PSUSpec {
  wattage: number;
  efficiency_rating: string | null;
  modular: string | null;
  form_factor: string | null;
}

export interface CaseSpec {
  form_factor: string;
  max_gpu_length_mm: number | null;
  max_cooler_height_mm: number | null;
  drive_bays_35: number | null;
  drive_bays_25: number | null;
  usb_ports: string | null;
}

export interface CoolerSpec {
  cooler_type: string | null;
  height_mm: number | null;
  tdp_rating_w: number | null;
  fan_size_mm: number | null;
  supported_sockets: string;
}

export interface Component {
  id: number;
  name: string;
  model: string;
  category_slug: string;
  category_name: string;
  manufacturer_name: string;
  description: string | null;
  image_url: string | null;
  release_year: number | null;
  min_price: number | null;
  prices: Price[];
  cpu: CPUSpec | null;
  motherboard: MotherboardSpec | null;
  ram: RAMSpec | null;
  gpu: GPUSpec | null;
  storage: StorageSpec | null;
  psu: PSUSpec | null;
  case: CaseSpec | null;
  cooler: CoolerSpec | null;
  monitor: MonitorSpec | null;
  keyboard: KeyboardSpec | null;
  mouse: MouseSpec | null;
}

export interface ComponentList {
  id: number;
  name: string;
  model: string;
  category_slug: string;
  manufacturer_name: string;
  min_price: number | null;
  image_url: string | null;
  compatible: boolean | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface MonitorSpec {
  panel_type: string | null;
  resolution: string | null;
  refresh_rate_hz: number | null;
  response_time_ms: number | null;
  size_inch: number | null;
  hdr: boolean;
  freesync: boolean;
  gsync: boolean;
  connectors: string | null;
  curved: boolean;
}

export interface KeyboardSpec {
  kb_type: string | null;
  switch_type: string | null;
  layout: string | null;
  wireless: boolean;
  rgb: boolean;
  connector: string | null;
}

export interface MouseSpec {
  max_dpi: number | null;
  sensor: string | null;
  buttons: number | null;
  wireless: boolean;
  rgb: boolean;
  weight_g: number | null;
  polling_rate_hz: number | null;
}

export interface Build {
  id: number;
  name: string;
  description: string | null;
  author: string | null;
  is_preset: boolean;
  purpose: string | null;
  tier: string | null;
  created_at: string;
  total_price: number | null;
  components_count: number;
}

export interface BuildDetail extends Build {
  components: Component[];
  compatibility_issues: string[];
  total_tdp: number | null;
}
