import { FactCard } from "@/components/site/stat";

export function KeyFacts() {
  return (
    <div className="mx-auto -mt-2 grid max-w-6xl grid-cols-2 gap-3 px-4 pb-4 sm:px-8 lg:grid-cols-4">
      <FactCard
        eyebrow="Formátum"
        value={
          <>
            SBD full power,
            <br />
            IPF szabályok
          </>
        }
      />
      <FactCard
        eyebrow="Kategóriák"
        value={
          <>
            Újonc · Versenyző
            <br />
            Női · Férfi
          </>
        }
      />
      <FactCard
        eyebrow="Pontozás"
        value={
          <>
            IPF GL pont,
            <br />
            nincs súlycsoport
          </>
        }
      />
      <FactCard
        eyebrow="A díj tartalmazza"
        value={
          <>
            Média csomag +<br />
            SBD versenypóló
          </>
        }
      />
    </div>
  );
}
