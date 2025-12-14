import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="w-full flex flex-col p-4 dark:bg-gray-900 bg-white md:justify-between place-content-start md:items-center justify-left text-sm md:flex-row">
      <Logo />
      
      <div className="text-xs">
        <p>Por Greison Castilla - Kevin Carmona</p>
        <p className="flex flex-row gap-1 transition-all ease-in-out duration-300 ">
          Datos tomados de
          <a
            href="https://www.datos.gov.co/Educaci-n/Resultados-nicos-Saber-11/kgxf-xxbe/about_data"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            Datos Abiertos Colombia
          </a>
        </p>
        
        <p>2025</p>
      </div>
    </footer>
  );
}
