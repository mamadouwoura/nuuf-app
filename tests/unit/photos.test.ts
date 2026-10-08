import { describe, expect, it } from "vitest";
import { lireFichier, typeImage } from "@/lib/photos";

const avec = (entete: number[], taille = 20) => Uint8Array.from([...entete, ...new Array(taille).fill(0)]);

describe("détection du type d'image par le contenu", () => {
  it("reconnaît JPEG, PNG et WebP", () => {
    expect(typeImage(avec([0xff, 0xd8, 0xff, 0xe0]))?.type).toBe("image/jpeg");
    expect(typeImage(avec([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.type).toBe("image/png");
    const webp = Uint8Array.from([..."RIFF"].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [..."WEBP"].map((c) => c.charCodeAt(0)), [0, 0, 0, 0]));
    expect(typeImage(webp)?.type).toBe("image/webp");
  });
  it("refuse tout le reste, y compris SVG et HTML même nommés .png", () => {
    const enc = new TextEncoder();
    expect(typeImage(enc.encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>"))).toBeNull();
    expect(typeImage(enc.encode("<html><script>alert(1)</script></html>"))).toBeNull();
    expect(typeImage(enc.encode("GIF89a......................"))).toBeNull();
    expect(typeImage(new Uint8Array(0))).toBeNull();
  });
});

describe("accès aux fichiers", () => {
  it("refuse les noms qui ressemblent à un chemin", async () => {
    expect(await lireFichier("../../.env")).toBeNull();
    expect(await lireFichier("..\..\.env")).toBeNull();
    expect(await lireFichier("/etc/passwd")).toBeNull();
    expect(await lireFichier("abc.png")).toBeNull();
  });
});
