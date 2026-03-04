import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
        <Construction size={36} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm max-w-sm">
        {description || "Halaman ini sedang dalam pengembangan. Silakan cek kembali nanti."}
      </p>
    </div>
  );
}
