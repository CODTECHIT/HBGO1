import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings } from "../../hooks/useData";
import { api } from "../../api/axios";
import { toast } from "sonner";
import { Loader2, ImagePlus } from "lucide-react";

export function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const [formData, setFormData] = useState({
    storeName: "",
    logoUrl: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    shippingCharge: 50,
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        logoUrl: settings.logoUrl || "",
        email: settings.email || "",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        address: settings.address || "",
        shippingCharge: settings.shippingCharge ?? 50,
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("image", file);

    setIsUploading(true);
    try {
      const res = await api.post("/upload?type=banner", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, logoUrl: res.data.url });
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData, {
      onSuccess: () => {
        toast.success("Store settings updated globally!");
      },
      onError: () => {
        toast.error("Failed to update settings");
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <>
      <Helmet>
        <title>Settings | Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="font-poppins font-bold text-2xl text-foreground">Store Settings</h1>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 max-w-3xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h3 className="font-poppins font-bold text-lg text-foreground border-b border-border pb-2">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Store Name</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Support Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Support Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">WhatsApp Number</label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Store Address</label>
                  <textarea rows={3} name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Delivery Charge (₹)</label>
                  <input type="number" min="0" name="shippingCharge" value={formData.shippingCharge} onChange={handleChange} required className="w-full md:w-1/2 px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Store Logo</label>
                  <div className="flex items-center gap-4">
                    {formData.logoUrl && (
                      <div className="w-24 h-24 rounded-xl border border-border overflow-hidden bg-white flex items-center justify-center shrink-0">
                        <img src={formData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors w-max">
                        {isUploading ? <Loader2 size={18} className="animate-spin text-muted-foreground" /> : <ImagePlus size={18} className="text-muted-foreground" />}
                        <span className="text-sm font-medium text-muted-foreground">{isUploading ? "Uploading..." : "Upload New Logo"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">Recommended size: 256x256px. Formats: PNG, JPG.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isPending || isUploading} className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isPending ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
