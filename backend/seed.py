"""Seed: components + peripherals + preset builds."""
from urllib.parse import quote_plus
from app.database import SessionLocal, engine
from app.database import Base
from app.models import *  # noqa

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Skip seeding if already populated
from app.models.component import Category as _Cat  # noqa
if db.query(_Cat).count() > 0:
    print("Database already seeded, skipping.")
    db.close()
    raise SystemExit(0)

from app.models.component import Category, CategorySlug, Manufacturer
from app.models.component import (
    Component, CPU, Motherboard, RAM, GPU,
    Storage, PSU, Case, Cooler, Monitor, Keyboard, Mouse, Price,
)
from app.models.build import Build, BuildComponent

def dns(m):      return f"https://www.dns-shop.ru/search/?q={quote_plus(m)}"
def citilink(m): return f"https://www.citilink.ru/search/?text={quote_plus(m)}"
def ozon(m):     return f"https://www.ozon.ru/search/?text={quote_plus(m)}&from_global=true"
def yandex(m):   return f"https://market.yandex.ru/search?text={quote_plus(m)}"

# ── Categories ────────────────────────────────────────────────────────────────
cats = {
    slug: Category(name=name, slug=slug, description=desc)
    for slug, name, desc in [
        (CategorySlug.cpu,         "Процессоры",        "Центральные процессоры"),
        (CategorySlug.motherboard, "Материнские платы", "Платы для установки компонентов"),
        (CategorySlug.ram,         "Оперативная память","RAM DDR4/DDR5"),
        (CategorySlug.gpu,         "Видеокарты",        "Графические ускорители"),
        (CategorySlug.storage,     "Накопители",        "SSD и HDD"),
        (CategorySlug.psu,         "Блоки питания",     "Источники питания ATX"),
        (CategorySlug.case,        "Корпуса",           "Корпуса для ПК"),
        (CategorySlug.cooler,      "Охлаждение",        "Кулеры и СВО"),
        (CategorySlug.monitor,     "Мониторы",          "Дисплеи для ПК"),
        (CategorySlug.keyboard,    "Клавиатуры",        "Проводные и беспроводные клавиатуры"),
        (CategorySlug.mouse,       "Мыши",              "Игровые и офисные мыши"),
    ]
}
db.add_all(cats.values())

# ── Manufacturers ─────────────────────────────────────────────────────────────
mfrs = {n: Manufacturer(name=n, country=c) for n, c in [
    ("Intel","США"),("AMD","США"),("NVIDIA","США"),
    ("ASUS","Тайвань"),("MSI","Тайвань"),("Gigabyte","Тайвань"),
    ("Corsair","США"),("Kingston","США"),("Samsung","Южная Корея"),
    ("Seagate","США"),("WD","США"),("be quiet!","Германия"),
    ("Noctua","Австрия"),("Fractal","Швеция"),("Seasonic","Тайвань"),
    ("LG","Южная Корея"),("BenQ","Тайвань"),("Acer","Тайвань"),
    ("Logitech","Швейцария"),("HyperX","США"),("Razer","США"),
    ("SteelSeries","Дания"),("Deepcool","Китай"),("ADATA","Тайвань"),
    ("Crucial","США"),
]}
db.add_all(mfrs.values())
db.flush()

created: dict[str, Component] = {}

def add(cat_slug, mfr, name, model, spec, prices, **kw):
    comp = Component(
        name=name, model=model,
        category_id=cats[cat_slug].id,
        manufacturer_id=mfrs[mfr].id,
        **kw,
    )
    db.add(comp)
    db.flush()
    spec.component_id = comp.id
    db.add(spec)
    for store, price, fn in prices:
        db.add(Price(component_id=comp.id, store_name=store, price_rub=price, url=fn(model)))
    created[model] = comp
    return comp

P = lambda *args: list(args)  # shorthand for prices list

# ╔══════════════════════════════════════════════════════╗
# ║  CPUs                                                ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.cpu,"Intel","Intel Core i9-14900K","Core i9-14900K",
    CPU(socket="LGA1700",cores=24,threads=32,base_freq_ghz=3.2,boost_freq_ghz=6.0,
        tdp_w=125,memory_type="DDR5",integrated_graphics=True,l3_cache_mb=36),
    [("DNS",43990,dns),("Citilink",44500,citilink),("OZON",42800,ozon)], release_year=2023)

add(CategorySlug.cpu,"Intel","Intel Core i7-14700K","Core i7-14700K",
    CPU(socket="LGA1700",cores=20,threads=28,base_freq_ghz=3.4,boost_freq_ghz=5.6,
        tdp_w=125,memory_type="DDR5",integrated_graphics=True,l3_cache_mb=33),
    [("DNS",31990,dns),("Citilink",32500,citilink),("OZON",31000,ozon)], release_year=2023)

add(CategorySlug.cpu,"Intel","Intel Core i5-13600K","Core i5-13600K",
    CPU(socket="LGA1700",cores=14,threads=20,base_freq_ghz=3.5,boost_freq_ghz=5.1,
        tdp_w=125,memory_type="DDR5",integrated_graphics=True,l3_cache_mb=24),
    [("DNS",22990,dns),("Citilink",23500,citilink),("OZON",22500,ozon)], release_year=2022)

add(CategorySlug.cpu,"Intel","Intel Core i5-13400F","Core i5-13400F",
    CPU(socket="LGA1700",cores=10,threads=16,base_freq_ghz=2.5,boost_freq_ghz=4.6,
        tdp_w=65,memory_type="DDR4",integrated_graphics=False,l3_cache_mb=20),
    [("DNS",13990,dns),("Citilink",14200,citilink),("OZON",13500,ozon)], release_year=2023)

add(CategorySlug.cpu,"Intel","Intel Core i3-13100","Core i3-13100",
    CPU(socket="LGA1700",cores=4,threads=8,base_freq_ghz=3.4,boost_freq_ghz=4.5,
        tdp_w=60,memory_type="DDR4",integrated_graphics=True,l3_cache_mb=12),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9700,ozon)], release_year=2023)

add(CategorySlug.cpu,"AMD","AMD Ryzen 9 7950X","Ryzen 9 7950X",
    CPU(socket="AM5",cores=16,threads=32,base_freq_ghz=4.5,boost_freq_ghz=5.7,
        tdp_w=170,memory_type="DDR5",integrated_graphics=False,l3_cache_mb=64),
    [("DNS",49990,dns),("Citilink",51000,citilink),("OZON",48900,ozon)], release_year=2022)

add(CategorySlug.cpu,"AMD","AMD Ryzen 9 7900X","Ryzen 9 7900X",
    CPU(socket="AM5",cores=12,threads=24,base_freq_ghz=4.7,boost_freq_ghz=5.6,
        tdp_w=170,memory_type="DDR5",integrated_graphics=False,l3_cache_mb=64),
    [("DNS",34990,dns),("Citilink",36000,citilink),("OZON",34000,ozon)], release_year=2022)

add(CategorySlug.cpu,"AMD","AMD Ryzen 7 7700X","Ryzen 7 7700X",
    CPU(socket="AM5",cores=8,threads=16,base_freq_ghz=4.5,boost_freq_ghz=5.4,
        tdp_w=105,memory_type="DDR5",integrated_graphics=False,l3_cache_mb=32),
    [("DNS",24990,dns),("Citilink",25500,citilink),("OZON",24500,ozon)], release_year=2022)

add(CategorySlug.cpu,"AMD","AMD Ryzen 5 7600X","Ryzen 5 7600X",
    CPU(socket="AM5",cores=6,threads=12,base_freq_ghz=4.7,boost_freq_ghz=5.3,
        tdp_w=105,memory_type="DDR5",integrated_graphics=False,l3_cache_mb=32),
    [("DNS",17990,dns),("Citilink",18500,citilink),("OZON",17500,ozon)], release_year=2022)

add(CategorySlug.cpu,"AMD","AMD Ryzen 5 5600X","Ryzen 5 5600X",
    CPU(socket="AM4",cores=6,threads=12,base_freq_ghz=3.7,boost_freq_ghz=4.6,
        tdp_w=65,memory_type="DDR4",integrated_graphics=False,l3_cache_mb=32),
    [("DNS",12990,dns),("Citilink",13200,citilink),("OZON",12500,ozon)], release_year=2020)

add(CategorySlug.cpu,"AMD","AMD Ryzen 5 5500","Ryzen 5 5500",
    CPU(socket="AM4",cores=6,threads=12,base_freq_ghz=3.6,boost_freq_ghz=4.2,
        tdp_w=65,memory_type="DDR4",integrated_graphics=False,l3_cache_mb=16),
    [("DNS",8990,dns),("Citilink",9200,citilink),("OZON",8700,ozon)], release_year=2021)

# ╔══════════════════════════════════════════════════════╗
# ║  Motherboards                                        ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.motherboard,"ASUS","ASUS ROG Strix Z790-E Gaming","ROG Strix Z790-E",
    Motherboard(socket="LGA1700",chipset="Z790",form_factor="ATX",ram_slots=4,
                max_ram_gb=128,ram_type="DDR5",max_ram_speed_mhz=7800,pcie_slots=3,m2_slots=5,sata_ports=4),
    [("DNS",34990,dns),("Citilink",35500,citilink)], release_year=2022)

add(CategorySlug.motherboard,"MSI","MSI MAG B760 Tomahawk","MAG B760 Tomahawk",
    Motherboard(socket="LGA1700",chipset="B760",form_factor="ATX",ram_slots=4,
                max_ram_gb=128,ram_type="DDR5",max_ram_speed_mhz=6400,pcie_slots=2,m2_slots=3,sata_ports=6),
    [("DNS",16990,dns),("Citilink",17500,citilink),("OZON",16500,ozon)], "mb2",release_year=2023)

add(CategorySlug.motherboard,"MSI","MSI MAG B660M Mortar","MAG B660M Mortar",
    Motherboard(socket="LGA1700",chipset="B660",form_factor="mATX",ram_slots=4,
                max_ram_gb=128,ram_type="DDR4",max_ram_speed_mhz=4800,pcie_slots=2,m2_slots=2,sata_ports=4),
    [("DNS",11990,dns),("Citilink",12200,citilink),("OZON",11700,ozon)], "mb2",release_year=2022)

add(CategorySlug.motherboard,"ASUS","ASUS Prime B760M-A","Prime B760M-A DDR4",
    Motherboard(socket="LGA1700",chipset="B760",form_factor="mATX",ram_slots=4,
                max_ram_gb=128,ram_type="DDR4",max_ram_speed_mhz=4800,pcie_slots=1,m2_slots=2,sata_ports=4),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9600,ozon)], release_year=2023)

add(CategorySlug.motherboard,"Gigabyte","Gigabyte X670E Aorus Master","X670E Aorus Master",
    Motherboard(socket="AM5",chipset="X670E",form_factor="ATX",ram_slots=4,
                max_ram_gb=128,ram_type="DDR5",max_ram_speed_mhz=6400,pcie_slots=3,m2_slots=4,sata_ports=4),
    [("DNS",39990,dns),("Citilink",41000,citilink)], release_year=2022)

add(CategorySlug.motherboard,"MSI","MSI B650 Tomahawk","B650 Tomahawk WiFi",
    Motherboard(socket="AM5",chipset="B650",form_factor="ATX",ram_slots=4,
                max_ram_gb=128,ram_type="DDR5",max_ram_speed_mhz=6400,pcie_slots=2,m2_slots=3,sata_ports=6),
    [("DNS",19990,dns),("Citilink",20500,citilink),("OZON",19500,ozon)], "mb2",release_year=2022)

add(CategorySlug.motherboard,"MSI","MSI B550 Tomahawk","B550 Tomahawk",
    Motherboard(socket="AM4",chipset="B550",form_factor="ATX",ram_slots=4,
                max_ram_gb=128,ram_type="DDR4",max_ram_speed_mhz=5100,pcie_slots=2,m2_slots=2,sata_ports=6),
    [("DNS",12990,dns),("Citilink",13500,citilink),("OZON",12700,ozon)], "mb2",release_year=2020)

add(CategorySlug.motherboard,"ASUS","ASUS Prime A520M-K","Prime A520M-K",
    Motherboard(socket="AM4",chipset="A520",form_factor="mATX",ram_slots=2,
                max_ram_gb=64,ram_type="DDR4",max_ram_speed_mhz=4600,pcie_slots=1,m2_slots=1,sata_ports=4),
    [("DNS",6990,dns),("Citilink",7200,citilink),("OZON",6700,ozon)], release_year=2020)

# ╔══════════════════════════════════════════════════════╗
# ║  RAM                                                 ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.ram,"Corsair","Corsair Vengeance DDR5-6000 32GB","Vengeance DDR5-6000 32GB",
    RAM(ram_type="DDR5",capacity_gb=32,speed_mhz=6000,modules_count=2,cas_latency=36,voltage_v=1.35),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9700,ozon)], release_year=2022)

add(CategorySlug.ram,"Kingston","Kingston FURY Beast DDR5-5600 32GB","FURY Beast DDR5-5600 32GB",
    RAM(ram_type="DDR5",capacity_gb=32,speed_mhz=5600,modules_count=2,cas_latency=40,voltage_v=1.25),
    [("DNS",8990,dns),("Citilink",9200,citilink),("OZON",8700,ozon)], "ram2",release_year=2022)

add(CategorySlug.ram,"Crucial","Crucial Pro DDR5-5600 16GB","Crucial Pro DDR5-5600 16GB",
    RAM(ram_type="DDR5",capacity_gb=16,speed_mhz=5600,modules_count=2,cas_latency=46,voltage_v=1.1),
    [("DNS",5490,dns),("Citilink",5700,citilink),("OZON",5300,ozon)], release_year=2023)

add(CategorySlug.ram,"Corsair","Corsair Vengeance DDR4-3200 32GB","Vengeance DDR4-3200 32GB",
    RAM(ram_type="DDR4",capacity_gb=32,speed_mhz=3200,modules_count=2,cas_latency=16,voltage_v=1.35),
    [("DNS",6990,dns),("Citilink",7200,citilink),("OZON",6800,ozon)], "ram2",release_year=2020)

add(CategorySlug.ram,"Kingston","Kingston FURY Beast DDR4-3600 16GB","FURY Beast DDR4-3600 16GB",
    RAM(ram_type="DDR4",capacity_gb=16,speed_mhz=3600,modules_count=2,cas_latency=17,voltage_v=1.35),
    [("DNS",4990,dns),("Citilink",5200,citilink),("OZON",4800,ozon)], release_year=2021)

add(CategorySlug.ram,"ADATA","ADATA XPG Lancer DDR5-6000 32GB","XPG Lancer DDR5-6000 32GB",
    RAM(ram_type="DDR5",capacity_gb=32,speed_mhz=6000,modules_count=2,cas_latency=30,voltage_v=1.35),
    [("DNS",10990,dns),("Citilink",11200,citilink),("OZON",10700,ozon)], "ram2",release_year=2022)

# ╔══════════════════════════════════════════════════════╗
# ║  GPUs                                                ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.gpu,"ASUS","ASUS ROG Strix RTX 4090 OC 24GB","ROG Strix RTX 4090 OC 24G",
    GPU(vram_gb=24,vram_type="GDDR6X",tdp_w=450,length_mm=357,pcie_version="PCIe 4.0 x16",
        power_connectors="3x8-pin",cuda_cores=16384,recommended_psu_w=850),
    [("DNS",149990,dns),("Citilink",154000,citilink)], release_year=2022)

add(CategorySlug.gpu,"MSI","MSI GeForce RTX 4080 Super Gaming X Slim","RTX 4080 Super Gaming X Slim",
    GPU(vram_gb=16,vram_type="GDDR6X",tdp_w=320,length_mm=337,pcie_version="PCIe 4.0 x16",
        power_connectors="3x8-pin",cuda_cores=10240,recommended_psu_w=750),
    [("DNS",89990,dns),("Citilink",92000,citilink),("OZON",88000,ozon)], "gpu2",release_year=2024)

add(CategorySlug.gpu,"MSI","MSI GeForce RTX 4070 Ti Gaming X Trio","RTX 4070 Ti Gaming X Trio",
    GPU(vram_gb=12,vram_type="GDDR6X",tdp_w=285,length_mm=336,pcie_version="PCIe 4.0 x16",
        power_connectors="3x8-pin",cuda_cores=7680,recommended_psu_w=700),
    [("DNS",69990,dns),("Citilink",71000,citilink),("OZON",68500,ozon)], release_year=2023)

add(CategorySlug.gpu,"Gigabyte","Gigabyte RTX 4070 Super Eagle OC","RTX 4070 Super Eagle OC 12G",
    GPU(vram_gb=12,vram_type="GDDR6X",tdp_w=220,length_mm=302,pcie_version="PCIe 4.0 x16",
        power_connectors="2x8-pin",cuda_cores=7168,recommended_psu_w=650),
    [("DNS",54990,dns),("Citilink",56000,citilink),("OZON",53500,ozon)], "gpu2",release_year=2024)

add(CategorySlug.gpu,"MSI","MSI GeForce RTX 4060 Ti Gaming X","RTX 4060 Ti Gaming X 8G",
    GPU(vram_gb=8,vram_type="GDDR6",tdp_w=165,length_mm=304,pcie_version="PCIe 4.0 x16",
        power_connectors="1x16-pin",cuda_cores=4352,recommended_psu_w=600),
    [("DNS",44990,dns),("Citilink",46000,citilink),("OZON",43500,ozon)], release_year=2023)

add(CategorySlug.gpu,"MSI","MSI GeForce RTX 4060 Gaming X","RTX 4060 Gaming X 8G",
    GPU(vram_gb=8,vram_type="GDDR6",tdp_w=115,length_mm=282,pcie_version="PCIe 4.0 x16",
        power_connectors="1x16-pin",cuda_cores=3072,recommended_psu_w=550),
    [("DNS",34990,dns),("Citilink",35500,citilink),("OZON",34200,ozon)], "gpu2",release_year=2023)

add(CategorySlug.gpu,"Gigabyte","Gigabyte RX 7900 XTX Gaming OC 24GB","RX 7900 XTX Gaming OC 24G",
    GPU(vram_gb=24,vram_type="GDDR6",tdp_w=355,length_mm=336,pcie_version="PCIe 4.0 x16",
        power_connectors="3x8-pin",recommended_psu_w=800),
    [("DNS",89990,dns),("Citilink",91000,citilink)], release_year=2022)

add(CategorySlug.gpu,"Gigabyte","Gigabyte RX 7600 Gaming OC 8GB","RX 7600 Gaming OC 8G",
    GPU(vram_gb=8,vram_type="GDDR6",tdp_w=165,length_mm=242,pcie_version="PCIe 4.0 x8",
        power_connectors="1x8-pin",recommended_psu_w=550),
    [("DNS",24990,dns),("Citilink",25500,citilink),("OZON",24500,ozon)], "gpu2",release_year=2023)

add(CategorySlug.gpu,"Gigabyte","Gigabyte RX 6600 Eagle 8GB","RX 6600 Eagle 8G",
    GPU(vram_gb=8,vram_type="GDDR6",tdp_w=132,length_mm=275,pcie_version="PCIe 4.0 x8",
        power_connectors="1x8-pin",recommended_psu_w=550),
    [("DNS",21990,dns),("Citilink",22500,citilink),("OZON",21500,ozon)], release_year=2021)

# ╔══════════════════════════════════════════════════════╗
# ║  Storage                                             ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.storage,"Samsung","Samsung 990 Pro 2TB NVMe","990 Pro 2TB NVMe M.2",
    Storage(storage_type="SSD",interface="M.2 NVMe",capacity_gb=2000,read_speed_mbs=7450,write_speed_mbs=6900,form_factor="M.2 2280"),
    [("DNS",14990,dns),("Citilink",15500,citilink),("OZON",14700,ozon)], release_year=2022)

add(CategorySlug.storage,"Samsung","Samsung 990 Pro 1TB NVMe","990 Pro 1TB NVMe M.2",
    Storage(storage_type="SSD",interface="M.2 NVMe",capacity_gb=1000,read_speed_mbs=7450,write_speed_mbs=6900,form_factor="M.2 2280"),
    [("DNS",8990,dns),("Citilink",9200,citilink),("OZON",8700,ozon)], release_year=2022)

add(CategorySlug.storage,"WD","WD Black SN850X 1TB NVMe","Black SN850X 1TB NVMe",
    Storage(storage_type="SSD",interface="M.2 NVMe",capacity_gb=1000,read_speed_mbs=7300,write_speed_mbs=6600,form_factor="M.2 2280"),
    [("DNS",7990,dns),("Citilink",8200,citilink),("OZON",7700,ozon)], release_year=2022)

add(CategorySlug.storage,"Kingston","Kingston KC3000 2TB NVMe","KC3000 2TB NVMe M.2",
    Storage(storage_type="SSD",interface="M.2 NVMe",capacity_gb=2000,read_speed_mbs=7000,write_speed_mbs=7000,form_factor="M.2 2280"),
    [("DNS",12990,dns),("Citilink",13500,citilink),("OZON",12500,ozon)], release_year=2022)

add(CategorySlug.storage,"Samsung","Samsung 870 EVO 1TB SATA","870 EVO 1TB SATA SSD",
    Storage(storage_type="SSD",interface="SATA",capacity_gb=1000,read_speed_mbs=560,write_speed_mbs=530,form_factor='2.5"'),
    [("DNS",7990,dns),("Citilink",8200,citilink),("OZON",7700,ozon)], release_year=2021)

add(CategorySlug.storage,"Seagate","Seagate Barracuda 2TB 7200rpm","Barracuda 2TB 7200rpm HDD",
    Storage(storage_type="HDD",interface="SATA",capacity_gb=2000,read_speed_mbs=190,write_speed_mbs=190,form_factor='3.5"'),
    [("DNS",4990,dns),("Citilink",5200,citilink),("OZON",4800,ozon)], release_year=2020)

add(CategorySlug.storage,"WD","WD Red Plus 4TB NAS","WD Red Plus 4TB 5400rpm",
    Storage(storage_type="HDD",interface="SATA",capacity_gb=4000,read_speed_mbs=180,write_speed_mbs=180,form_factor='3.5"'),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9700,ozon)], release_year=2021)

# ╔══════════════════════════════════════════════════════╗
# ║  PSUs                                                ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.psu,"be quiet!","be quiet! Dark Power 13 1000W","Dark Power 13 1000W",
    PSU(wattage=1000,efficiency_rating="80+ Titanium",modular="Full",form_factor="ATX"),
    [("DNS",19990,dns),("Citilink",20500,citilink)], release_year=2022)

add(CategorySlug.psu,"Seasonic","Seasonic Focus GX-850 850W","Focus GX-850 80+ Gold",
    PSU(wattage=850,efficiency_rating="80+ Gold",modular="Full",form_factor="ATX"),
    [("DNS",12990,dns),("Citilink",13200,citilink),("OZON",12700,ozon)], release_year=2021)

add(CategorySlug.psu,"Corsair","Corsair RM850x 850W","RM850x 2021 80+ Gold",
    PSU(wattage=850,efficiency_rating="80+ Gold",modular="Full",form_factor="ATX"),
    [("DNS",13990,dns),("Citilink",14500,citilink),("OZON",13500,ozon)], release_year=2021)

add(CategorySlug.psu,"Corsair","Corsair RM750x 750W","RM750x 2021 80+ Gold",
    PSU(wattage=750,efficiency_rating="80+ Gold",modular="Full",form_factor="ATX"),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9700,ozon)], release_year=2021)

add(CategorySlug.psu,"be quiet!","be quiet! Pure Power 12 M 650W","Pure Power 12 M 650W",
    PSU(wattage=650,efficiency_rating="80+ Gold",modular="Semi",form_factor="ATX"),
    [("DNS",7990,dns),("Citilink",8200,citilink),("OZON",7700,ozon)], release_year=2023)

add(CategorySlug.psu,"Seasonic","Seasonic Focus GX-550 550W","Focus GX-550 80+ Gold",
    PSU(wattage=550,efficiency_rating="80+ Gold",modular="Full",form_factor="ATX"),
    [("DNS",7490,dns),("Citilink",7700,citilink),("OZON",7200,ozon)], release_year=2021)

# ╔══════════════════════════════════════════════════════╗
# ║  Cases                                               ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.case,"Fractal","Fractal Design Define 7 ATX","Define 7 ATX Mid-Tower",
    Case(form_factor="ATX",max_gpu_length_mm=491,max_cooler_height_mm=185,drive_bays_35=3,drive_bays_25=3,usb_ports="2x USB 3.0, 1x USB-C"),
    [("DNS",14990,dns),("Citilink",15500,citilink)], release_year=2020)

add(CategorySlug.case,"Fractal","Fractal Design Meshify 2","Meshify 2 ATX",
    Case(form_factor="ATX",max_gpu_length_mm=467,max_cooler_height_mm=185,drive_bays_35=3,drive_bays_25=3,usb_ports="2x USB 3.0, 1x USB-C"),
    [("DNS",12990,dns),("Citilink",13200,citilink),("OZON",12700,ozon)], "case2",release_year=2020)

add(CategorySlug.case,"ASUS","ASUS TUF Gaming GT501","TUF Gaming GT501 ATX",
    Case(form_factor="ATX",max_gpu_length_mm=420,max_cooler_height_mm=180,drive_bays_35=2,drive_bays_25=2,usb_ports="2x USB 3.0, 1x USB-C"),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9700,ozon)], release_year=2020)

add(CategorySlug.case,"Fractal","Fractal Design Pop Mini Air","Pop Mini Air mATX",
    Case(form_factor="mATX",max_gpu_length_mm=340,max_cooler_height_mm=170,drive_bays_35=1,drive_bays_25=2,usb_ports="2x USB 3.0"),
    [("DNS",7990,dns),("Citilink",8200,citilink),("OZON",7700,ozon)], "case2",release_year=2022)

# ╔══════════════════════════════════════════════════════╗
# ║  Coolers                                             ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.cooler,"Noctua","Noctua NH-D15 Dual Tower","NH-D15 Dual Tower",
    Cooler(cooler_type="Air",height_mm=165,tdp_rating_w=250,fan_size_mm=140,supported_sockets="LGA1700,LGA1200,AM5,AM4,AM3+"),
    [("DNS",8990,dns),("Citilink",9200,citilink),("OZON",8700,ozon)], release_year=2020)

add(CategorySlug.cooler,"be quiet!","be quiet! Dark Rock Pro 4","Dark Rock Pro 4 Air",
    Cooler(cooler_type="Air",height_mm=162,tdp_rating_w=250,fan_size_mm=135,supported_sockets="LGA1700,LGA1200,AM5,AM4,AM3+"),
    [("DNS",6990,dns),("Citilink",7200,citilink),("OZON",6800,ozon)], release_year=2019)

add(CategorySlug.cooler,"Deepcool","Deepcool AK620","AK620 Dual Tower",
    Cooler(cooler_type="Air",height_mm=160,tdp_rating_w=260,fan_size_mm=120,supported_sockets="LGA1700,LGA1200,AM5,AM4,AM3+"),
    [("DNS",4490,dns),("Citilink",4700,citilink),("OZON",4300,ozon)], release_year=2021)

add(CategorySlug.cooler,"Corsair","Corsair iCUE H150i Elite Capellix 360mm","iCUE H150i Elite 360 AIO",
    Cooler(cooler_type="AIO 360",height_mm=27,tdp_rating_w=350,fan_size_mm=120,supported_sockets="LGA1700,LGA1200,AM5,AM4"),
    [("DNS",15990,dns),("Citilink",16500,citilink)], release_year=2021)

add(CategorySlug.cooler,"Corsair","Corsair iCUE H100i RGB Pro XT 240mm","iCUE H100i RGB 240 AIO",
    Cooler(cooler_type="AIO 240",height_mm=27,tdp_rating_w=250,fan_size_mm=120,supported_sockets="LGA1700,LGA1200,AM5,AM4"),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9700,ozon)], release_year=2020)

add(CategorySlug.cooler,"Noctua","Noctua NH-U12S Redux","NH-U12S Redux Tower",
    Cooler(cooler_type="Air",height_mm=158,tdp_rating_w=150,fan_size_mm=120,supported_sockets="LGA1700,LGA1200,AM5,AM4,AM3+"),
    [("DNS",4990,dns),("Citilink",5200,citilink),("OZON",4800,ozon)], release_year=2020)

# ╔══════════════════════════════════════════════════════╗
# ║  Monitors                                            ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.monitor,"LG","LG UltraGear 27GP850-B 27\" QHD 165Hz","LG 27GP850-B 27 QHD 165Hz",
    Monitor(panel_type="IPS",resolution="2560x1440",refresh_rate_hz=165,response_time_ms=1.0,
            size_inch=27.0,hdr=True,freesync=True,gsync=True,connectors="HDMI 2.0, DisplayPort 1.4",curved=False),
    [("DNS",28990,dns),("Citilink",29500,citilink),("OZON",28500,ozon)], release_year=2021)

add(CategorySlug.monitor,"ASUS","ASUS ROG Strix XG279Q 27\" QHD 170Hz","ASUS ROG XG279Q 27 QHD 170Hz",
    Monitor(panel_type="IPS",resolution="2560x1440",refresh_rate_hz=170,response_time_ms=1.0,
            size_inch=27.0,hdr=True,freesync=True,gsync=True,connectors="HDMI 2.0, 2x DisplayPort 1.2",curved=False),
    [("DNS",34990,dns),("Citilink",35500,citilink)], "monitor2",release_year=2020)

add(CategorySlug.monitor,"MSI","MSI MAG 274QRF-QD 27\" QHD 165Hz","MSI MAG274QRF-QD 27 QHD",
    Monitor(panel_type="IPS",resolution="2560x1440",refresh_rate_hz=165,response_time_ms=1.0,
            size_inch=27.0,hdr=True,freesync=True,connectors="HDMI 2.0b, DisplayPort 1.4",curved=False),
    [("DNS",24990,dns),("Citilink",25500,citilink),("OZON",24500,ozon)], release_year=2022)

add(CategorySlug.monitor,"Acer","Acer Nitro XV272U 27\" QHD 144Hz","Acer Nitro XV272U 27 QHD",
    Monitor(panel_type="IPS",resolution="2560x1440",refresh_rate_hz=144,response_time_ms=1.0,
            size_inch=27.0,hdr=False,freesync=True,connectors="HDMI 2.0, DisplayPort 1.2",curved=False),
    [("DNS",19990,dns),("Citilink",20500,citilink),("OZON",19500,ozon)], "monitor2",release_year=2021)

add(CategorySlug.monitor,"LG","LG 27UK850 27\" 4K IPS 60Hz","LG 27UK850 27 4K 60Hz",
    Monitor(panel_type="IPS",resolution="3840x2160",refresh_rate_hz=60,response_time_ms=5.0,
            size_inch=27.0,hdr=True,freesync=False,connectors="HDMI 2.0, DisplayPort 1.4, USB-C",curved=False),
    [("DNS",32990,dns),("Citilink",33500,citilink),("OZON",32000,ozon)], release_year=2020)

add(CategorySlug.monitor,"MSI","MSI Optix G24C6 24\" FHD 144Hz Curved","MSI Optix G24C6 24 FHD 144Hz",
    Monitor(panel_type="VA",resolution="1920x1080",refresh_rate_hz=144,response_time_ms=1.0,
            size_inch=24.0,hdr=False,freesync=True,connectors="HDMI, DisplayPort",curved=True),
    [("DNS",12990,dns),("Citilink",13200,citilink),("OZON",12500,ozon)], "monitor2",release_year=2021)

add(CategorySlug.monitor,"ASUS","ASUS VP249QGR 24\" FHD 144Hz","ASUS VP249QGR 24 FHD 144Hz",
    Monitor(panel_type="IPS",resolution="1920x1080",refresh_rate_hz=144,response_time_ms=1.0,
            size_inch=24.0,hdr=False,freesync=True,connectors="HDMI, DisplayPort, VGA",curved=False),
    [("DNS",10990,dns),("Citilink",11200,citilink),("OZON",10700,ozon)], release_year=2020)

# ╔══════════════════════════════════════════════════════╗
# ║  Keyboards                                           ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.keyboard,"HyperX","HyperX Alloy Origins Core TKL","HyperX Alloy Origins Core Red",
    Keyboard(kb_type="Mechanical",switch_type="HyperX Red Linear",layout="TKL",wireless=False,rgb=True,connector="USB-C"),
    [("DNS",7990,dns),("Citilink",8200,citilink),("OZON",7700,ozon)], "keyboard2",release_year=2020)

add(CategorySlug.keyboard,"Razer","Razer BlackWidow V3 Tenkeyless","Razer BlackWidow V3 TKL Green",
    Keyboard(kb_type="Mechanical",switch_type="Razer Green Clicky",layout="TKL",wireless=False,rgb=True,connector="USB-A"),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9700,ozon)], release_year=2020)

add(CategorySlug.keyboard,"Logitech","Logitech G Pro X TKL","Logitech G Pro X TKL Blue",
    Keyboard(kb_type="Mechanical",switch_type="GX Blue Clicky",layout="TKL",wireless=False,rgb=True,connector="USB-C"),
    [("DNS",12990,dns),("Citilink",13200,citilink),("OZON",12700,ozon)], "keyboard2",release_year=2021)

add(CategorySlug.keyboard,"SteelSeries","SteelSeries Apex Pro TKL","Apex Pro TKL OmniPoint",
    Keyboard(kb_type="Mechanical",switch_type="OmniPoint Adjustable",layout="TKL",wireless=False,rgb=True,connector="USB-C"),
    [("DNS",19990,dns),("Citilink",20500,citilink)], release_year=2021)

add(CategorySlug.keyboard,"Logitech","Logitech G213 Prodigy Full","Logitech G213 Prodigy Membrane",
    Keyboard(kb_type="Membrane",switch_type="Mech-dome",layout="Full",wireless=False,rgb=True,connector="USB-A"),
    [("DNS",3990,dns),("Citilink",4200,citilink),("OZON",3700,ozon)], "keyboard2",release_year=2020)

add(CategorySlug.keyboard,"HyperX","HyperX Alloy Origins Full RGB","HyperX Alloy Origins Red Full",
    Keyboard(kb_type="Mechanical",switch_type="HyperX Red Linear",layout="Full",wireless=False,rgb=True,connector="USB-C"),
    [("DNS",8990,dns),("Citilink",9200,citilink),("OZON",8700,ozon)], release_year=2020)

# ╔══════════════════════════════════════════════════════╗
# ║  Mice                                                ║
# ╚══════════════════════════════════════════════════════╝
add(CategorySlug.mouse,"Logitech","Logitech G502 X Plus Wireless","Logitech G502 X Plus Wireless",
    Mouse(max_dpi=25600,sensor="HERO 25K",buttons=13,wireless=True,rgb=True,weight_g=106,polling_rate_hz=2000),
    [("DNS",12990,dns),("Citilink",13200,citilink),("OZON",12700,ozon)], release_year=2022)

add(CategorySlug.mouse,"Logitech","Logitech G502 HERO Wired","Logitech G502 HERO Wired",
    Mouse(max_dpi=25600,sensor="HERO 25K",buttons=11,wireless=False,rgb=True,weight_g=121,polling_rate_hz=1000),
    [("DNS",5990,dns),("Citilink",6200,citilink),("OZON",5700,ozon)], "mouse2",release_year=2019)

add(CategorySlug.mouse,"Razer","Razer DeathAdder V3 HyperSpeed","Razer DeathAdder V3 HyperSpeed",
    Mouse(max_dpi=26000,sensor="Razer Focus Pro 30K",buttons=5,wireless=True,rgb=False,weight_g=81,polling_rate_hz=1000),
    [("DNS",7990,dns),("Citilink",8200,citilink),("OZON",7700,ozon)], release_year=2023)

add(CategorySlug.mouse,"Razer","Razer Viper V2 Pro Wireless","Razer Viper V2 Pro White",
    Mouse(max_dpi=30000,sensor="Razer Focus Pro 30K",buttons=5,wireless=True,rgb=False,weight_g=58,polling_rate_hz=8000),
    [("DNS",14990,dns),("Citilink",15500,citilink),("OZON",14500,ozon)], "mouse2",release_year=2022)

add(CategorySlug.mouse,"SteelSeries","SteelSeries Rival 650 Wireless","SteelSeries Rival 650 Wireless",
    Mouse(max_dpi=12000,sensor="TrueMove3+",buttons=7,wireless=True,rgb=True,weight_g=121,polling_rate_hz=1000),
    [("DNS",9990,dns),("Citilink",10200,citilink),("OZON",9700,ozon)], release_year=2018)

add(CategorySlug.mouse,"Logitech","Logitech M185 Wireless Office","Logitech M185 Wireless",
    Mouse(max_dpi=1000,sensor="Optical",buttons=3,wireless=True,rgb=False,weight_g=75,polling_rate_hz=125),
    [("DNS",1490,dns),("Citilink",1600,citilink),("OZON",1390,ozon)], "mouse2",release_year=2019)

db.flush()

# ╔══════════════════════════════════════════════════════╗
# ║  PRESET BUILDS                                       ║
# ╚══════════════════════════════════════════════════════╝
def preset(name, desc, purpose, tier, models):
    b = Build(name=name, description=desc, purpose=purpose, tier=tier, is_preset=True)
    db.add(b)
    db.flush()
    for m in models:
        if m in created:
            db.add(BuildComponent(build_id=b.id, component_id=created[m].id))
        else:
            print(f"  WARN: '{m}' not found in created dict")
    return b


preset(
    "Бюджетный гейминг",
    "Идеальный старт для игр на высоких настройках в 1080p. Ryzen 5 5500 и RX 6600 "
    "уверенно справятся с большинством современных игр при 60–100 FPS. "
    "Доступная цена, минимальный шум, простой апгрейд в будущем.",
    "gaming", "budget",
    ["Ryzen 5 5500", "Prime A520M-K", "FURY Beast DDR4-3600 16GB",
     "RX 6600 Eagle 8G", "Focus GX-550 80+ Gold", "Pop Mini Air mATX",
     "NH-U12S Redux Tower", "870 EVO 1TB SATA SSD"],
)

preset(
    "Игровой ПК 1080p Средний",
    "Оптимальный выбор для комфортного гейминга в 1080p при 100–144 FPS. "
    "Core i5-13400F в паре с RTX 4060 обеспечивают плавный геймплей в любых играх. "
    "Отличное соотношение цены и производительности на 2024–2025 годы.",
    "gaming", "mid",
    ["Core i5-13400F", "MAG B660M Mortar", "FURY Beast DDR4-3600 16GB",
     "RTX 4060 Gaming X 8G", "RM750x 2021 80+ Gold", "TUF Gaming GT501 ATX",
     "AK620 Dual Tower", "990 Pro 1TB NVMe M.2"],
)

preset(
    "Игровой ПК 1440p",
    "Топовый геймерский сетап для игры в разрешении 2K на максимальных настройках. "
    "Core i5-13600K + RTX 4070 Ti обеспечат 100+ FPS в любой игре при 1440p. "
    "Подходит для стриминга и контент-мейкинга параллельно с игрой.",
    "gaming", "high",
    ["Core i5-13600K", "MAG B760 Tomahawk", "Vengeance DDR5-6000 32GB",
     "RTX 4070 Ti Gaming X Trio", "RM850x 2021 80+ Gold", "Meshify 2 ATX",
     "iCUE H100i RGB 240 AIO", "990 Pro 1TB NVMe M.2", "Barracuda 2TB 7200rpm HDD"],
)

preset(
    "Игровой флагман 4K",
    "Абсолютный топ для игр в 4K и VR. Core i9-14900K и RTX 4090 — лучшее, "
    "что сейчас можно собрать. Никаких компромиссов: трассировка лучей, "
    "DLSS 3, 60+ FPS в 4K на ультра настройках.",
    "gaming", "ultra",
    ["Core i9-14900K", "ROG Strix Z790-E", "Vengeance DDR5-6000 32GB",
     "ROG Strix RTX 4090 OC 24G", "Dark Power 13 1000W", "Define 7 ATX Mid-Tower",
     "iCUE H150i Elite 360 AIO", "990 Pro 2TB NVMe M.2", "WD Red Plus 4TB 5400rpm"],
)

preset(
    "Рабочая станция",
    "Мощная рабочая станция для 3D, видеомонтажа и работы с большими данными. "
    "Ryzen 9 7950X с 16 ядрами и 64 ГБ DDR5 RAM для параллельного рендеринга. "
    "NVMe SSD и HDD для хранения больших проектов.",
    "workstation", "ultra",
    ["Ryzen 9 7950X", "X670E Aorus Master", "XPG Lancer DDR5-6000 32GB",
     "RX 7900 XTX Gaming OC 24G", "Dark Power 13 1000W", "Define 7 ATX Mid-Tower",
     "iCUE H150i Elite 360 AIO", "990 Pro 2TB NVMe M.2", "WD Red Plus 4TB 5400rpm"],
)

preset(
    "Стример Pro",
    "Сбалансированная сборка для стриминга в 1080p60 без потери FPS в игре. "
    "Core i7-14700K имеет достаточно ядер, чтобы одновременно играть и кодировать "
    "поток в OBS. RTX 4070 Super даёт плавный геймплей в 1440p.",
    "streaming", "high",
    ["Core i7-14700K", "MAG B760 Tomahawk", "Vengeance DDR5-6000 32GB",
     "RTX 4070 Super Eagle OC 12G", "RM850x 2021 80+ Gold", "Meshify 2 ATX",
     "iCUE H150i Elite 360 AIO", "990 Pro 1TB NVMe M.2"],
)

preset(
    "Офисный ПК",
    "Тихий и надёжный офисный компьютер для работы, интернета и документов. "
    "Core i3-13100 со встроенной графикой не требует видеокарты. "
    "Компактный корпус mATX, минимальный шум, доступная цена.",
    "office", "budget",
    ["Core i3-13100", "Prime B760M-A DDR4", "Vengeance DDR4-3200 32GB",
     "Focus GX-550 80+ Gold", "Pop Mini Air mATX",
     "NH-U12S Redux Tower", "870 EVO 1TB SATA SSD"],
)

db.commit()
print(f"✓ Создано компонентов: {len(created)}")
print("✓ База данных заполнена.")
db.close()
