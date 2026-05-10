from app.models.component import Component

_FF_ORDER = {"ATX": 3, "mATX": 2, "ITX": 1}


def check_compatibility(components: list[Component]) -> list[str]:
    issues = []
    by_cat = {c.category.slug.value: c for c in components if c.category}

    cpu = by_cat.get("cpu")
    mb  = by_cat.get("motherboard")
    ram = by_cat.get("ram")
    gpu = by_cat.get("gpu")
    psu = by_cat.get("psu")
    case = by_cat.get("case")
    cooler = by_cat.get("cooler")

    if cpu and mb:
        cs, ms = (cpu.cpu.socket if cpu.cpu else None), (mb.motherboard.socket if mb.motherboard else None)
        if cs and ms and cs != ms:
            issues.append(f"Несовместимый сокет: CPU использует {cs}, а материнская плата — {ms}.")

    if ram and mb:
        rt, mt = (ram.ram.ram_type if ram.ram else None), (mb.motherboard.ram_type if mb.motherboard else None)
        if rt and mt and rt != mt:
            issues.append(f"Несовместимый тип памяти: RAM {rt}, материнская плата поддерживает {mt}.")

    if ram and mb and ram.ram and mb.motherboard:
        if ram.ram.capacity_gb > mb.motherboard.max_ram_gb:
            issues.append(
                f"Слишком много RAM: {ram.ram.capacity_gb} ГБ превышает максимум "
                f"материнской платы ({mb.motherboard.max_ram_gb} ГБ)."
            )

    if psu and psu.psu:
        needed = 100 + (cpu.cpu.tdp_w if cpu and cpu.cpu else 0) + (gpu.gpu.tdp_w if gpu and gpu.gpu else 0)
        if psu.psu.wattage < needed:
            issues.append(
                f"Недостаточная мощность БП: {psu.psu.wattage} Вт, "
                f"рекомендуется минимум {needed} Вт."
            )

    if gpu and case and gpu.gpu and case.case:
        if gpu.gpu.length_mm and case.case.max_gpu_length_mm and gpu.gpu.length_mm > case.case.max_gpu_length_mm:
            issues.append(
                f"Видеокарта не помещается в корпус: {gpu.gpu.length_mm} мм > {case.case.max_gpu_length_mm} мм."
            )

    if cooler and case and cooler.cooler and case.case:
        if cooler.cooler.height_mm and case.case.max_cooler_height_mm and cooler.cooler.height_mm > case.case.max_cooler_height_mm:
            issues.append(
                f"Кулер не помещается в корпус: {cooler.cooler.height_mm} мм > {case.case.max_cooler_height_mm} мм."
            )

    if cooler and cpu and cooler.cooler and cpu.cpu:
        supported = [s.strip() for s in cooler.cooler.supported_sockets.split(",")]
        if cpu.cpu.socket not in supported:
            issues.append(f"Кулер не поддерживает сокет {cpu.cpu.socket}.")

    if mb and case and mb.motherboard and case.case:
        mb_ff, case_ff = mb.motherboard.form_factor, case.case.form_factor
        if _FF_ORDER.get(mb_ff, 0) > _FF_ORDER.get(case_ff, 99):
            issues.append(f"Материнская плата {mb_ff} не помещается в корпус {case_ff}.")

    return issues


def calculate_total_tdp(components: list[Component]) -> int:
    return sum(
        (c.cpu.tdp_w if c.cpu else 0) + (c.gpu.tdp_w if c.gpu else 0)
        for c in components
    )


def derive_constraints(selected: list[Component]) -> dict:
    """Extract compatibility constraints from the already-selected components."""
    by_cat = {c.category.slug.value: c for c in selected if c.category}
    constraints: dict = {}

    cpu  = by_cat.get("cpu")
    mb   = by_cat.get("motherboard")
    case = by_cat.get("case")
    gpu  = by_cat.get("gpu")
    psu  = by_cat.get("psu")
    cpu_tdp = cpu.cpu.tdp_w if cpu and cpu.cpu else 0
    gpu_tdp = gpu.gpu.tdp_w if gpu and gpu.gpu else 0

    if cpu and cpu.cpu:
        constraints["cpu_socket"]   = cpu.cpu.socket
        constraints["ram_type"]     = cpu.cpu.memory_type

    if mb and mb.motherboard:
        constraints["mb_socket"]      = mb.motherboard.socket
        constraints["ram_type"]       = mb.motherboard.ram_type   # overrides cpu memory_type
        constraints["mb_form_factor"] = mb.motherboard.form_factor

    if case and case.case:
        constraints["case_form_factor"] = case.case.form_factor
        if case.case.max_gpu_length_mm:
            constraints["max_gpu_length"] = case.case.max_gpu_length_mm
        if case.case.max_cooler_height_mm:
            constraints["max_cooler_height"] = case.case.max_cooler_height_mm

    if cpu_tdp or gpu_tdp:
        constraints["min_psu_wattage"] = cpu_tdp + gpu_tdp + 100

    return constraints


def is_compatible_with(component: Component, constraints: dict) -> bool:
    """Return False if the component violates any constraint from already-selected parts."""
    if not constraints or not component.category:
        return True

    cat = component.category.slug.value

    if cat == "cpu" and component.cpu:
        if "mb_socket" in constraints and component.cpu.socket != constraints["mb_socket"]:
            return False
        # RAM type hint (from MB): CPU memory_type must match
        if "ram_type" in constraints and "mb_socket" in constraints:
            if component.cpu.memory_type != constraints["ram_type"]:
                return False

    elif cat == "motherboard" and component.motherboard:
        if "cpu_socket" in constraints and component.motherboard.socket != constraints["cpu_socket"]:
            return False
        if "ram_type" in constraints and component.motherboard.ram_type != constraints["ram_type"]:
            return False
        if "case_form_factor" in constraints:
            case_ff = constraints["case_form_factor"]
            mb_ff   = component.motherboard.form_factor
            if _FF_ORDER.get(mb_ff, 0) > _FF_ORDER.get(case_ff, 99):
                return False

    elif cat == "ram" and component.ram:
        if "ram_type" in constraints and component.ram.ram_type != constraints["ram_type"]:
            return False

    elif cat == "cooler" and component.cooler:
        if "cpu_socket" in constraints:
            supported = [s.strip() for s in component.cooler.supported_sockets.split(",")]
            if constraints["cpu_socket"] not in supported:
                return False
        if "max_cooler_height" in constraints and component.cooler.height_mm:
            if component.cooler.height_mm > constraints["max_cooler_height"]:
                return False

    elif cat == "gpu" and component.gpu:
        if "max_gpu_length" in constraints and component.gpu.length_mm:
            if component.gpu.length_mm > constraints["max_gpu_length"]:
                return False

    elif cat == "case" and component.case:
        if "mb_form_factor" in constraints:
            mb_ff   = constraints["mb_form_factor"]
            case_ff = component.case.form_factor
            if _FF_ORDER.get(mb_ff, 0) > _FF_ORDER.get(case_ff, 99):
                return False

    elif cat == "psu" and component.psu:
        if "min_psu_wattage" in constraints and component.psu.wattage < constraints["min_psu_wattage"]:
            return False

    return True
