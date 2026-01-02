"use client";

import { Clock, Edit, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createService,
  deleteService,
  getAllServices,
  updateService,
} from "@/lib/actions/service.actions";
import { cn } from "@/lib/utils";
import { Service } from "@/types/appwrite.types";

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: "medical" | "cosmetic";
  isActive: boolean;
}

const defaultFormData: ServiceFormData = {
  name: "",
  description: "",
  duration: 30,
  price: 0,
  category: "medical",
  isActive: true,
};

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<"all" | "medical" | "cosmetic">("all");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        price: service.price,
        category: service.category || "medical",
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (editingService) {
          await updateService(editingService.$id, formData);
        } else {
          await createService(formData);
        }
        await loadServices();
        handleCloseModal();
      } catch (error) {
        console.error("Error saving service:", error);
      }
    });
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    startTransition(async () => {
      try {
        await deleteService(serviceToDelete.$id);
        await loadServices();
        setDeleteConfirmOpen(false);
        setServiceToDelete(null);
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    });
  };

  const filteredServices = services.filter((service) => {
    if (categoryFilter === "all") return true;
    return service.category === categoryFilter;
  });

  const medicalCount = services.filter((s) => s.category === "medical").length;
  const cosmeticCount = services.filter((s) => s.category === "cosmetic").length;
  const activeCount = services.filter((s) => s.isActive).length;

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicii</h1>
          <p className="text-gray-500">
            Gestionați serviciile oferite de clinică
          </p>
        </div>
        <Button className="shad-primary-btn gap-2" onClick={() => handleOpenModal()}>
          <Plus className="size-4" />
          Adaugă serviciu
        </Button>
      </div>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <GlassCard variant="default" padding="default">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gold-100/80">
              <Sparkles className="size-6 text-gold-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              <p className="text-sm text-gray-500">Total servicii</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default" padding="default">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100/80">
              <Sparkles className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{medicalCount}</p>
              <p className="text-sm text-gray-500">Medicale</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default" padding="default">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-pink-100/80">
              <Sparkles className="size-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{cosmeticCount}</p>
              <p className="text-sm text-gray-500">Cosmetice</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="gold" padding="default">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-teal-100/80">
              <Sparkles className="size-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Category Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            categoryFilter === "all"
              ? "bg-gold-500 text-white"
              : "bg-white/60 text-gray-600 hover:bg-white/80"
          )}
        >
          Toate ({services.length})
        </button>
        <button
          onClick={() => setCategoryFilter("medical")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            categoryFilter === "medical"
              ? "bg-blue-500 text-white"
              : "bg-white/60 text-gray-600 hover:bg-white/80"
          )}
        >
          Medicale ({medicalCount})
        </button>
        <button
          onClick={() => setCategoryFilter("cosmetic")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            categoryFilter === "cosmetic"
              ? "bg-pink-500 text-white"
              : "bg-white/60 text-gray-600 hover:bg-white/80"
          )}
        >
          Cosmetice ({cosmeticCount})
        </button>
      </div>

      {/* Services List */}
      <GlassCard variant="default" padding="lg">
        <GlassCardHeader className="pb-4">
          <GlassCardTitle>Lista serviciilor</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-4 border-gold-200 border-t-gold-500" />
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <div
                  key={service.$id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 transition-all hover:bg-white/80",
                    !service.isActive && "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        service.category === "cosmetic"
                          ? "bg-pink-100/80"
                          : "bg-blue-100/80"
                      )}
                    >
                      <Sparkles
                        className={cn(
                          "size-5",
                          service.category === "cosmetic"
                            ? "text-pink-600"
                            : "text-blue-600"
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        {!service.isActive && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                            Inactiv
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {service.duration} min
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full",
                            service.category === "cosmetic"
                              ? "bg-pink-50 text-pink-600"
                              : "bg-blue-50 text-blue-600"
                          )}
                        >
                          {service.category === "cosmetic" ? "Cosmetic" : "Medical"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {service.price} MDL
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-gray-500 hover:text-gold-600"
                        onClick={() => handleOpenModal(service)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-gray-500 hover:text-red-600"
                        onClick={() => {
                          setServiceToDelete(service);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gold-100/50 backdrop-blur-sm">
                <Sparkles className="size-8 text-gold-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Nu există servicii
              </h3>
              <p className="text-gray-500 mb-4">
                Adăugați servicii pentru a le putea asocia programărilor.
              </p>
              <Button className="shad-primary-btn gap-2" onClick={() => handleOpenModal()}>
                <Plus className="size-4" />
                Adaugă primul serviciu
              </Button>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Create/Edit Service Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editează serviciu" : "Adaugă serviciu nou"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Modificați detaliile serviciului."
                : "Completați detaliile pentru noul serviciu."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nume serviciu *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Consultație"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descriere opțională a serviciului"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durată (minute) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  step={5}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preț (MDL) *</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "medical" | "cosmetic") =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="cosmetic">Cosmetic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="size-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
              />
              <Label htmlFor="isActive" className="font-normal">
                Serviciu activ
              </Label>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isPending}
              >
                Anulează
              </Button>
              <Button type="submit" className="shad-primary-btn" disabled={isPending}>
                {isPending ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : editingService ? (
                  "Salvează"
                ) : (
                  "Adaugă"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmă dezactivarea</DialogTitle>
            <DialogDescription>
              Sunteți sigur că doriți să dezactivați serviciul &quot;{serviceToDelete?.name}&quot;?
              Serviciul va fi marcat ca inactiv și nu va mai apărea în lista de servicii
              disponibile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isPending}
            >
              Anulează
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Dezactivează"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
