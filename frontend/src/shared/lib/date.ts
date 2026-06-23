export function getLocalDateInputValue(date: Date = new Date()): string {
    const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - timezoneOffsetMs)
        .toISOString()
        .split('T')[0];
}
