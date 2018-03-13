class Utils {
    coerceFloat(value: string): number {
        const parsed = parseFloat(value);
        if (isNaN(parsed) || typeof parsed !== "number") {
            return undefined;
        }
        return parsed;
    }

    coerceInt(value: string): number {
        const parsed = parseInt(value);
        if (isNaN(parsed) || typeof parsed !== "number") {
            return undefined;
        }
        return parsed;
    }
}

export default new Utils();
