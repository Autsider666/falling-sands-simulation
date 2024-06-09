export class StringHelper {
    static toClassName(string: string): string {
        return string.replace(/\s+/g, '-').toLowerCase();
    }
}