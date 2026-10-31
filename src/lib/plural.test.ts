import { describe, expect, it } from "vitest";
import { plPlural } from "./plural";

describe("plPlural", () => {
  it("picks the one form for 1", () => {
    expect(plPlural(1, "zadanie", "zadania", "zadań")).toBe("zadanie");
  });

  it("picks the few form for 2-4", () => {
    expect(plPlural(2, "lekcja", "lekcje", "lekcji")).toBe("lekcje");
    expect(plPlural(3, "lekcja", "lekcje", "lekcji")).toBe("lekcje");
    expect(plPlural(4, "zadanie", "zadania", "zadań")).toBe("zadania");
  });

  it("picks the many form for 5 and up", () => {
    expect(plPlural(5, "zadanie", "zadania", "zadań")).toBe("zadań");
    expect(plPlural(14, "zadanie", "zadania", "zadań")).toBe("zadań");
    expect(plPlural(21, "lekcja", "lekcje", "lekcji")).toBe("lekcji");
  });

  it("keeps the few form for 22-24 but not for 12", () => {
    expect(plPlural(22, "zadanie", "zadania", "zadań")).toBe("zadania");
    expect(plPlural(12, "zadanie", "zadania", "zadań")).toBe("zadań");
  });
});
