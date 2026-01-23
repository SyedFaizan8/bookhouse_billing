function applyCharge(base: number, charge: any) {
    return charge.valueType === "PERCENT"
        ? (base * charge.value) / 100
        : charge.value;
}
