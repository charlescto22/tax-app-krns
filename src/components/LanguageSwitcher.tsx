import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "mm" : "en")}
      className="w-12 font-semibold bg-card text-foreground border-gray-200"
    >
      {language === "en" ? "MM" : "EN"}
    </Button>
  );
}