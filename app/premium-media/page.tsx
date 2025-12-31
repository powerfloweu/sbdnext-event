import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";

const TEAM = [
  {
    name: "Hunyás Kata",
    role: "Fotós",
    img: "/kata.jpg",
    instagram: "visualsofkata",
    instagramUrl: "https://instagram.com/visualsofkata",
  },
  {
    name: "Lantos Bence",
    role: "Fotós",
    img: "/bence.jpg",
    instagram: "bencelantos",
    instagramUrl: "https://instagram.com/bencelantos",
  },
  {
    name: "Lakatos Márk",
    role: "Videós",
    img: "/mark.jpg",
    instagram: "mark_g_l_",
    instagramUrl: "https://instagram.com/mark_g_l_",
  },
  {
    name: "Schwalm Ákos",
    role: "Videós",
    img: "/akos.jpg",
    instagram: "akos.schwalm",
    instagramUrl: "https://instagram.com/akos.schwalm",
  },
];

export default function PremiumMediaPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-neutral-950 to-neutral-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-500/30 blur-[120px]" style={{ transform: "translate(-50%, -50%)" }} />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-red-600/20 blur-[100px]" style={{ transform: "translate(50%, 50%)" }} />
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-sm">
          <CardContent className="p-8">
            <h1 className="mb-6 text-3xl font-bold text-red-400">A versenyed napja. Dokumentálva.</h1>
            <p className="mb-4 text-neutral-200">
              Az SBD Next napján sok minden történik egyszerre.<br />
              A bemelegítés ritmusa, a ráhangolódás, ahogy bemagnéziázod a kezedet, becsattintod az övedet, majd kilépsz a platformra.<br />
              Ezután kilenc egyperces szakasz következik, amely teljes egészében a tiéd.<br /><br />
              A Premium Media Package célja, hogy ez a nap az egyik legerősebb emlékként maradjon meg számodra.
            </p>
            <h2 className="mt-8 mb-3 text-xl font-semibold text-red-300">A stáb, akik készítik</h2>
            <p className="mb-4 text-neutral-200">
              A prémium csomagot olyan szakemberek készítik, akik tapasztaltak versenykörnyezetben, és sok esetben maguk is erőemelő versenyzők.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TEAM.map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  <ProfileImage
                    src={member.img}
                    alt={member.name + " profilképe"}
                    className="h-12 w-12 rounded-full object-cover bg-neutral-800 border-2 border-red-400"
                  />
                  <div>
                    <div className="font-bold text-neutral-100">{member.name}</div>
                    <div className="text-xs text-neutral-400">{member.role}</div>
                    <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">
                      @{member.instagram}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p className="mb-6 text-neutral-300">
              A cél nem pusztán a látvány.<br />
              A cél az, hogy az adott pillanat pontosan és profi módon legyen rögzítve.
            </p>
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
              <span className="block text-sm text-red-300 mb-2 font-semibold">Fontos tudnivaló</span>
              <span className="block text-neutral-100">A Premium Media Package limitált számban érhető el a stáb kapacitása miatt.</span>
            </div>
            <a href="https://buy.stripe.com/3cIdRabMbfhkeUb6IT1ck03" target="_blank" rel="noopener noreferrer">
              <Button className="h-12 w-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-400 text-white text-base font-bold shadow-[0_0_40px_rgba(248,113,113,0.8)] hover:from-red-600 hover:via-red-500 hover:to-red-300 sm:h-14 sm:text-lg mb-4">
                Biztosítsd a helyedet még ma
              </Button>
            </a>
            <div className="mt-8 text-center">
              <a href="/" className="inline-block">
                <Button className="rounded-full px-6 py-2 bg-red-400 text-white font-semibold hover:bg-red-500 transition">Vissza a főoldalra</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
// ...existing code...
