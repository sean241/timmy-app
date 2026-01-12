"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Search, MapPin, Phone, Eye, EyeOff, X, Camera, RefreshCw, Printer, User, Archive, Mail, Upload, Pencil, AlertCircle, FileSpreadsheet, Download, CheckCircle, FileText, Loader2, ArrowRight, Shield } from "lucide-react";
import Webcam from "react-webcam";
import Image from "next/image";
import * as XLSX from 'xlsx';
import QRCode from "react-qr-code";
import Toast from "@/components/Toast";
import { useLanguage } from "@/app/context/LanguageContext";
import { uploadFile, BUCKETS } from "@/lib/storage";

// TypeScript interfaces for data models
import { Employee } from "@/types";

interface Site {
    id: string;
    name: string;
    is_active?: boolean;
}


export default function EmployeesPage() {
    const { t } = useLanguage();
    // Data
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [managerName, setManagerName] = useState<string>("");
    const [companyName, setCompanyName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);




    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSite, setFilterSite] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<"active" | "archived">("active");
    const [showDrawer, setShowDrawer] = useState(false);
    const [revealedPins, setRevealedPins] = useState<string[]>([]);

    // Import Wizard State
    const [showImportModal, setShowImportModal] = useState(false);
    const [importStep, setImportStep] = useState<1 | 2 | 3 | 4>(1);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [rawImportData, setRawImportData] = useState<{ headers: string[]; rows: any[] } | null>(null);
    const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>({
        firstName: "",
        lastName: "",
        jobTitle: "",
        whatsapp: "",
        email: "",
        pinCode: ""
    });
    const [importAnalysis, setImportAnalysis] = useState<{ total: number; newCount: number; duplicateCount: number; withPin: number; autoPin: number; data: any[] } | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [badgeEmployee, setBadgeEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        job_title: "",
        phone_code: "+241",
        whatsapp: "",
        email: "",
        pin: "",
        site_id: "",
        photo_url: ""
    });
    const [isWebcamOpen, setIsWebcamOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const fetchEmployees = useCallback(async (orgId: string) => {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('organization_id', orgId)
            .order('last_name');

        if (!error && data) {
            // Filter out the "Postes À Pourvoir" placeholder used in Planning
            const realEmployees = data.filter(e =>
                !`${e.first_name} ${e.last_name}`.toLowerCase().includes('pourvoir')
            );
            setEmployees(realEmployees);
        } else if (error) {
            console.error("Error fetching employees:", error);
        }
    }, [supabase]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('organization_id, first_name, last_name').eq('id', user.id).single();
                if (profile) {
                    setOrganizationId(profile.organization_id);
                    setManagerName(profile.first_name || "Manager");

                    if (profile.organization_id) {
                        const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.organization_id).single();
                        if (org) setCompanyName(org.name);

                        // Fetch employees and sites only if we have an organization
                        await fetchEmployees(profile.organization_id);
                        const { data: siteData, error: siteError } = await supabase.from('sites').select('*').eq('organization_id', profile.organization_id);
                        if (!siteError) setSites(siteData || []);
                    }
                }
            }
            setIsLoading(false);
        };
        fetchData();
    }, [fetchEmployees]);
    // Derived Data
    const counts = useMemo(() => {
        if (!employees) return { active: 0, archived: 0 };
        return {
            active: employees.filter(e => e.is_active).length,
            archived: employees.filter(e => !e.is_active).length
        };
    }, [employees]);

    const filteredEmployees = employees?.filter(emp => {
        const fullName = `${emp.first_name} ${emp.last_name}`;
        const matchesSearch = (fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.job_title?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSite = filterSite === "all" || emp.site_id === filterSite;
        const matchesStatus = filterStatus === "active" ? emp.is_active : !emp.is_active;
        return matchesSearch && matchesSite && matchesStatus;
    }).sort((a, b) => a.last_name.localeCompare(b.last_name));

    // Actions
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organizationId) {
            setToast({ message: t.employees.toast.orgNotFound, type: "error" });
            return;
        }

        const employeeData = {
            organization_id: organizationId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            job_title: formData.job_title,
            phone_code: formData.phone_code,
            whatsapp_number: formData.whatsapp,
            email: formData.email,
            pin_code: formData.pin,
            site_id: formData.site_id || null,
            avatar_url: formData.photo_url,
            is_active: true
        };
        if (editingId) {
            const { error } = await supabase.from('employees').update(employeeData).eq('id', editingId);
            if (error) {
                setToast({ message: `${t.employees.toast.updateError}: ${error.message}`, type: "error" });
            } else {
                setToast({ message: t.employees.toast.updateSuccess, type: "success" });
                // Refresh list
                await fetchEmployees(organizationId);
            }
        } else {
            const { error } = await supabase.from('employees').insert(employeeData);
            if (error) {
                setToast({ message: `${t.employees.toast.createError}: ${error.message}`, type: "error" });
            } else {
                setToast({ message: t.employees.toast.createSuccess, type: "success" });
                await fetchEmployees(organizationId);
            }
        }
        closeDrawer();
    };

    const handleArchive = async (id: string, currentStatus: boolean | undefined | null) => {
        if (window.confirm(currentStatus ? t.employees.toast.archiveConfirm : t.employees.toast.unarchiveConfirm)) {
            const { error } = await supabase.from('employees').update({ is_active: !currentStatus }).eq('id', id);
            if (error) {
                setToast({ message: `${t.employees.toast.archiveError}: ${error.message}`, type: "error" });
            } else {
                // Refresh list
                await fetchEmployees(organizationId!);
            }
        }
    };

    const handleVerifyWhatsapp = async (id: string, currentStatus: boolean | undefined) => {
        const updates = {
            is_whatsapp_verified: !currentStatus,
            whatsapp_verified_at: !currentStatus ? new Date().toISOString() : null
        };

        const { error } = await supabase.from('employees').update(updates).eq('id', id);

        if (error) {
            setToast({ message: `${t.employees.toast.verifyError}: ${error.message}`, type: "error" });
        } else {
            setToast({ message: !currentStatus ? t.employees.toast.verified : t.employees.toast.unverified, type: "success" });
            // Refresh list
            await fetchEmployees(organizationId!);
        }
    };

    const generatePin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setFormData(prev => ({ ...prev, pin }));
    };

    const togglePinReveal = (id: string) => {
        if (revealedPins.includes(id)) {
            setRevealedPins(prev => prev.filter(p => p !== id));
        } else {
            setRevealedPins(prev => [...prev, id]);
        }
    };

    const capturePhoto = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc && organizationId) {
            setIsUploadingPhoto(true);
            try {
                // Convert base64 to blob
                const res = await fetch(imageSrc);
                const blob = await res.blob();

                const fileExt = 'jpg';
                const fileName = `avatar-${Date.now()}.${fileExt}`;
                const filePath = `avatars/${organizationId}/${fileName}`;

                const { url, error } = await uploadFile(BUCKETS.PUBLIC_ASSETS, filePath, blob);
                if (error) throw error;

                setFormData(prev => ({ ...prev, photo_url: url || "" }));
                setIsWebcamOpen(false);
                setToast({ message: "Photo capturée et enregistrée", type: "success" });
            } catch (err) {
                console.error("Error uploading captured photo:", err);
                setToast({ message: "Erreur lors de l'enregistrement de la photo", type: "error" });
            } finally {
                setIsUploadingPhoto(false);
            }
        }
    }, [webcamRef, organizationId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && organizationId) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setToast({ message: "L'image est trop volumineuse (Max 2Mo)", type: "error" });
                return;
            }

            setIsUploadingPhoto(true);
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `avatar-${Date.now()}.${fileExt}`;
                const filePath = `avatars/${organizationId}/${fileName}`;

                const { url, error } = await uploadFile(BUCKETS.PUBLIC_ASSETS, filePath, file);
                if (error) throw error;

                setFormData(prev => ({ ...prev, photo_url: url || "" }));
                setToast({ message: "Photo ajoutée avec succès", type: "success" });
            } catch (err) {
                console.error("Error uploading photo:", err);
                setToast({ message: "Erreur lors de l'upload de la photo", type: "error" });
            } finally {
                setIsUploadingPhoto(false);
            }
        }
    };

    // Import Wizard Logic
    const openImportModal = () => {
        setImportStep(1);
        setImportFile(null);
        setImportAnalysis(null);
        setShowImportModal(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
            analyzeFile(file);
        }
    };

    const analyzeFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Get raw data with headers array

            if (data.length > 0) {
                const headers = data[0] as string[];
                const rows = data.slice(1);
                setRawImportData({ headers, rows });

                // Auto-map columns based on fuzzy matching
                const newMapping = { ...columnMapping };
                headers.forEach(header => {
                    const h = header.toLowerCase();
                    if (h.includes('first') || h.includes('prenom') || h.includes('prénom')) newMapping.firstName = header;
                    else if (h.includes('last') || h.includes('nom')) newMapping.lastName = header;
                    else if (h.includes('job') || h.includes('title') || h.includes('poste') || h.includes('metier')) newMapping.jobTitle = header;
                    else if (h.includes('what') || h.includes('tel') || h.includes('phone')) newMapping.whatsapp = header;
                    else if (h.includes('mail')) newMapping.email = header;
                    else if (h.includes('pin') || h.includes('code')) newMapping.pinCode = header;
                });
                setColumnMapping(newMapping);
                setImportStep(2); // Go to mapping step
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const processMapping = () => {
        if (!rawImportData) return;

        const { headers, rows } = rawImportData;
        let validCount = 0;
        let withPinCount = 0;
        let autoPinCount = 0;
        let newCount = 0;
        let duplicateCount = 0;
        const validData: any[] = [];

        // Existing employees map for fast lookup
        const existingPhones = new Set(employees?.map(e => e.whatsapp_number?.replace(/\D/g, '')));
        const existingNames = new Set(employees?.map(e => `${e.first_name} ${e.last_name}`.toLowerCase()));

        // Helper to get value by mapped header
        const getValue = (row: any[], headerName: string) => {
            const index = headers.indexOf(headerName);
            return index !== -1 ? row[index] : undefined;
        };

        for (const row of rows) {
            const firstName = getValue(row, columnMapping.firstName);
            const lastName = getValue(row, columnMapping.lastName);

            if (firstName && lastName) {
                validCount++;

                const fullName = `${firstName} ${lastName}`.trim();
                const whatsappRaw = getValue(row, columnMapping.whatsapp);
                const normalizedPhone = whatsappRaw ? whatsappRaw.toString().replace(/\D/g, '') : "";

                // Deduplication Logic
                const isPhoneDuplicate = normalizedPhone && existingPhones.has(normalizedPhone);
                const isNameDuplicate = !normalizedPhone && existingNames.has(fullName.toLowerCase());

                if (isPhoneDuplicate || isNameDuplicate) {
                    duplicateCount++;
                    continue;
                }

                newCount++;
                const pin = getValue(row, columnMapping.pinCode);
                if (pin) {
                    withPinCount++;
                } else {
                    autoPinCount++;
                }

                validData.push({
                    first_name: firstName,
                    last_name: lastName,
                    job_title: getValue(row, columnMapping.jobTitle),
                    whatsapp_number: whatsappRaw,
                    email: getValue(row, columnMapping.email),
                    pin_code: pin
                });
            }
        }

        setImportAnalysis({
            total: validCount,
            newCount: newCount,
            duplicateCount: duplicateCount,
            withPin: withPinCount,
            autoPin: autoPinCount,
            data: validData
        });
        setImportStep(3); // Go to analysis summary
    };

    const confirmImport = async () => {
        if (!importAnalysis) return;
        setIsImporting(true);

        try {
            if (!organizationId) {
                setToast({ message: t.employees.toast.orgNotFound, type: "error" });
                setIsImporting(false);
                return;
            }

            for (const row of importAnalysis.data) {
                const pin = row.pin_code ? row.pin_code.toString() : Math.floor(1000 + Math.random() * 9000).toString();
                const employeeData = {
                    organization_id: organizationId,
                    first_name: row.first_name || "",
                    last_name: row.last_name || "",
                    job_title: row.job_title || "",
                    whatsapp_number: row.whatsapp_number || "",
                    email: row.email || "",
                    pin_code: pin,
                    is_active: true
                };
                const { error } = await supabase.from('employees').insert(employeeData);
                if (error) {
                    console.error('Import error for row', row, error);
                    setToast({ message: `${t.employees.toast.importError}: ${error.message}`, type: "error" });
                }
            }
            // Refresh list after import
            await fetchEmployees(organizationId);
            setImportStep(4);
        } catch (error) {
            console.error("Import failed", error);
            alert(t.employees.toast.genericError);
        } finally {
            setIsImporting(false);
        }
    };
    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { 'First Name': "John", 'Last Name': "Doe", 'Job Title': "Mason", Whatsapp: "+1234567890", Email: "john@example.com", "PIN Code": "1234" }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Employees");
        XLSX.writeFile(wb, "employee_import_template.xlsx");
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            job_title: "",
            phone_code: "+241",
            whatsapp: "",
            email: "",
            pin: "",
            site_id: "",
            photo_url: ""
        });
        setEditingId(null);
        generatePin(); // Pre-fill PIN for new employees
    };

    const openDrawerForCreate = () => {
        resetForm();
        setShowDrawer(true);
    };

    const openDrawerForEdit = (emp: Employee) => {
        setEditingId(emp.id);
        setFormData({
            firstName: emp.first_name,
            lastName: emp.last_name,
            job_title: emp.job_title || "",
            phone_code: emp.phone_code || "+241",
            whatsapp: emp.whatsapp_number || "",
            email: emp.email || "",
            pin: emp.pin_code,
            site_id: emp.site_id || "",
            photo_url: emp.avatar_url || ""
        });
        setShowDrawer(true);
    };

    const closeDrawer = () => {
        setShowDrawer(false);
        resetForm();
        setIsWebcamOpen(false);
    };

    const handlePrintBadge = () => {
        window.print();
    };

    return (
        <div className="relative min-h-screen pb-20 print:pb-0">
            <style jsx global>{`
                @media print {
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                    body {
                        visibility: hidden;
                        margin: 0;
                        padding: 0;
                    }
                    #printable-badge-modal, #printable-badge-modal * {
                        visibility: visible;
                    }
                    #printable-badge-modal {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: auto;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        background: white;
                        display: block;
                        z-index: 9999;
                    }
                    #printable-badge-modal > div {
                        box-shadow: none;
                        border: 1px solid #ddd;
                        width: 100%;
                        max-width: 350px;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {/* Header Section */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.employees.title}</h1>
                        <p className="text-gray-500 mt-1">{t.employees.desc}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={openImportModal}
                            className="bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                            title={t.employees.import}
                        >
                            <FileSpreadsheet size={20} />
                            <span className="hidden sm:inline">{t.employees.import}</span>
                        </button>
                        <button
                            onClick={openDrawerForCreate}
                            className="bg-[#FFC107] text-[#0F4C5C] px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-[#FFD54F] transition-colors flex items-center gap-2"
                        >
                            <Plus size={20} />
                            {t.employees.newEmployee}
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={t.employees.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={filterSite}
                            onChange={(e) => setFilterSite(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                        >
                            <option value="all">{t.employees.allSites}</option>
                            {sites?.map(site => (
                                <option key={site.id} value={site.id}>{site.name}</option>
                            ))}
                        </select>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setFilterStatus("active")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                {t.employees.active}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === "active" ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"}`}>
                                    {counts.active}
                                </span>
                            </button>
                            <button
                                onClick={() => setFilterStatus("archived")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === "archived" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                {t.employees.archived}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === "archived" ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"}`}>
                                    {counts.archived}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employees Grid (Trombinoscope) */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
                            <div className="p-6 flex flex-col items-center text-center border-b border-gray-50">
                                <div className="w-24 h-24 rounded-full bg-gray-200 mb-4"></div>
                                <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
                                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="h-12 bg-gray-200 rounded-lg"></div>
                                <div className="flex gap-2">
                                    <div className="h-10 flex-1 bg-gray-200 rounded-lg"></div>
                                    <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmployees?.map((emp) => {
                        const site = sites?.find(s => s.id === emp.site_id);
                        const isPinRevealed = revealedPins.includes(emp.id!);

                        return (
                            <div key={emp.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative">
                                {/* Card Header */}
                                <div className="p-6 flex flex-col items-center text-center border-b border-gray-50">
                                    <div className="relative mb-4">
                                        {emp.avatar_url ? (
                                            <img src={emp.avatar_url} alt={emp.first_name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center text-2xl font-bold border-4 border-gray-50">
                                                {emp.first_name ? emp.first_name.substring(0, 1).toUpperCase() : ""}{emp.last_name ? emp.last_name.substring(0, 1).toUpperCase() : ""}
                                            </div>
                                        )}
                                        {!emp.is_active && (
                                            <span className="absolute bottom-0 right-0 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200 font-medium">
                                                {t.employees.card.archived}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg">{emp.first_name} {emp.last_name}</h3>
                                    <p className="text-gray-500 text-sm">{emp.job_title || "Employee"}</p>

                                    {site ? (
                                        <span className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                            <MapPin size={12} />
                                            {site.name}
                                        </span>
                                    ) : (
                                        <span className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 text-xs font-medium">
                                            <AlertCircle size={12} />
                                            {t.employees.card.unassigned}
                                        </span>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="p-4 bg-gray-50/50 space-y-3">
                                    {/* PIN Section */}
                                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.employees.card.pinCode}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-mono font-bold ${isPinRevealed ? "text-[#0F4C5C] text-lg" : "text-gray-400 text-xl tracking-widest"}`}>
                                                {isPinRevealed ? emp.pin_code : "••••"}
                                            </span>
                                            <button
                                                onClick={() => togglePinReveal(emp.id!)}
                                                className="text-gray-400 hover:text-[#0F4C5C] transition-colors p-1"
                                            >
                                                {isPinRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contact & Actions */}
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Left Side: WhatsApp & Verify */}
                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                            {emp.whatsapp_number ? (
                                                <>
                                                    <a
                                                        href={`https://api.whatsapp.com/send?phone=${(emp.full_phone_formatted || (emp.phone_code || '+241') + emp.whatsapp_number).replace(/\D/g, '')}&text=${encodeURIComponent(
                                                            `Bonjour ${emp.first_name} 👋,\n\nC'est ${managerName} de l'entreprise *${companyName}*.\n\nNous utilisons désormais l'application *Timmy* pour simplifier la gestion des chantiers. C'est ici que tu recevras *tes plannings et les infos importantes*. 🏗️\n\n👉 Merci de répondre *"OUI"* à ce message pour confirmer que c'est bien ton numéro WhatsApp.\n\nÀ très vite !`
                                                        )}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors text-sm font-medium truncate ${emp.is_whatsapp_verified ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600"}`}
                                                        title={emp.is_whatsapp_verified ? t.employees.card.verified : t.employees.card.sendVerification}
                                                    >
                                                        <Phone size={18} className="shrink-0" />
                                                        <span className="hidden xl:inline truncate">{t.employees.card.whatsapp}</span>
                                                    </a>
                                                    <button
                                                        onClick={() => handleVerifyWhatsapp(emp.id, emp.is_whatsapp_verified)}
                                                        className={`p-2 rounded-lg border transition-colors shrink-0 ${emp.is_whatsapp_verified ? "bg-green-50 border-green-200 text-green-600" : "bg-white border-gray-200 text-gray-300 hover:text-green-600 hover:border-green-200"}`}
                                                        title={emp.is_whatsapp_verified ? t.employees.card.unverify : t.employees.card.verifyManually}
                                                    >
                                                        <CheckCircle size={18} className={emp.is_whatsapp_verified ? "fill-green-600 text-white" : ""} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-xs text-gray-400 italic pl-1">{t.employees.card.noPhone}</div>
                                            )}
                                        </div>

                                        {/* Right Side: Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => openDrawerForEdit(emp)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-[#0F4C5C] hover:bg-blue-50 transition-colors"
                                                title={t.employees.card.edit}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => setBadgeEmployee(emp)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-[#0F4C5C] hover:bg-blue-50 transition-colors"
                                                title={t.employees.card.badge}
                                            >
                                                <Printer size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleArchive(emp.id!, emp.is_active)}
                                                className={`p-2 rounded-lg transition-colors ${!emp.is_active ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                                                title={!emp.is_active ? t.employees.card.unarchive : t.employees.card.archive}
                                            >
                                                <Archive size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {filteredEmployees?.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <User size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t.employees.noEmployees}</h3>
                    <p className="text-gray-500 mt-2">{t.employees.noEmployeesDesc}</p>
                </div>
            )}

            {/* Import Wizard Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">{t.employees.importModal.title}</h2>
                            <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* STEP 1: GUIDANCE & UPLOAD */}
                            {importStep === 1 && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                                        <p className="font-bold mb-1">💡 {t.employees.importModal.important}</p>
                                        <p>{t.employees.importModal.importantDesc}</p>
                                    </div>

                                    <button
                                        onClick={downloadTemplate}
                                        className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#0F4C5C] hover:bg-gray-50 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#0F4C5C]/10 group-hover:text-[#0F4C5C]">
                                            <Download size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-bold text-gray-900">{t.employees.importModal.downloadTemplate}</span>
                                            <span className="text-xs text-gray-500">{t.employees.importModal.templateDesc}</span>
                                        </div>
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">{t.employees.importModal.then}</span>
                                        </div>
                                    </div>

                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#0F4C5C] hover:bg-gray-50 transition-all cursor-pointer"
                                        onClick={() => importInputRef.current?.click()}
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                            <Upload size={32} />
                                        </div>
                                        <h3 className="font-bold text-gray-900">{t.employees.importModal.dragDrop}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{t.employees.importModal.browse}</p>
                                        <input
                                            type="file"
                                            ref={importInputRef}
                                            onChange={handleFileSelect}
                                            accept=".xlsx, .xls, .csv"
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: COLUMN MAPPING */}
                            {importStep === 2 && rawImportData && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                                        <p className="font-bold mb-1">{t.employees.importModal.mapColumns}</p>
                                        <p>{t.employees.importModal.mapDesc}</p>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {[
                                            { key: 'firstName', label: t.employees.form.firstName, required: true },
                                            { key: 'lastName', label: t.employees.form.lastName, required: true },
                                            { key: 'jobTitle', label: t.employees.form.jobTitle, required: false },
                                            { key: 'whatsapp', label: t.employees.form.whatsapp, required: false },
                                            { key: 'email', label: t.employees.form.email, required: false },
                                            { key: 'pinCode', label: t.employees.form.pinCode, required: false },
                                        ].map((field) => (
                                            <div key={field.key} className="flex flex-col gap-1">
                                                <label className="text-sm font-bold text-gray-700">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                <select
                                                    value={columnMapping[field.key]}
                                                    onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                    className={`w-full p-3 rounded-lg border ${!columnMapping[field.key] && field.required ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"} focus:ring-2 focus:ring-[#0F4C5C] outline-none`}
                                                >
                                                    <option value="">{t.employees.importModal.selectColumn}</option>
                                                    {rawImportData.headers.map((header, idx) => (
                                                        <option key={idx} value={header}>{header}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setImportStep(1)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            {t.employees.importModal.back}
                                        </button>
                                        <button
                                            onClick={processMapping}
                                            disabled={!columnMapping.firstName || !columnMapping.lastName}
                                            className="flex-1 px-4 py-3 bg-[#0F4C5C] text-white rounded-lg font-bold hover:bg-[#0a3641] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t.employees.importModal.next} <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: ANALYSIS */}
                            {importStep === 3 && importAnalysis && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <FileText className="text-gray-400" size={24} />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{t.employees.importModal.fileDetected}</p>
                                            <p className="text-xs text-gray-500">{importFile?.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-bold text-gray-900">{t.employees.importModal.analysis}</h3>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-2 flex items-center gap-2">
                                            <FileText size={16} className="text-gray-500" />
                                            <span className="text-sm text-gray-700">
                                                <span className="font-bold">{importAnalysis.total}</span> {t.employees.importModal.linesDetected}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                                                <span className="block text-2xl font-bold text-green-700">{importAnalysis.newCount}</span>
                                                <span className="text-xs text-green-800 font-medium">{t.employees.importModal.newEmployees}</span>
                                                <span className="text-[10px] text-green-600 block mt-1">{t.employees.importModal.readyImport}</span>
                                            </div>
                                            <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                                <span className="block text-2xl font-bold text-orange-700">{importAnalysis.duplicateCount}</span>
                                                <span className="text-xs text-orange-800 font-medium">{t.employees.importModal.duplicates}</span>
                                                <span className="text-[10px] text-orange-600 block mt-1">{t.employees.importModal.willIgnore}</span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>{importAnalysis.withPin} {t.employees.importModal.hasPin}</li>
                                                <li>{importAnalysis.autoPin} {t.employees.importModal.autoPin}</li>
                                            </ul>
                                        </div>

                                        <button
                                            onClick={confirmImport}
                                            className="w-full bg-[#0F4C5C] text-white py-3 rounded-xl font-bold hover:bg-[#0F4C5C]/90 transition-colors"
                                        >
                                            {t.employees.importModal.importBtn.replace('{count}', importAnalysis.newCount.toString())}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: SUCCESS */}
                            {importStep === 4 && (
                                <div className="text-center py-8 space-y-6">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-in zoom-in duration-300">
                                        <CheckCircle size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{t.employees.importModal.successTitle}</h3>
                                        <p className="text-gray-500 mt-2">
                                            <span className="font-bold text-gray-900">{importAnalysis?.newCount}</span> {importAnalysis?.newCount && importAnalysis?.newCount > 1 ? t.employees.importModal.successDesc : t.employees.importModal.successDescSingular}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowImportModal(false)}
                                        className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        {t.employees.importModal.close}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Employee Drawer (Right Side Panel) */}
            {showDrawer && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity"
                        onClick={closeDrawer}
                    />
                    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? t.employees.form.editTitle : t.employees.form.createTitle}
                            </h2>
                            <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <form onSubmit={handleSave} className="space-y-6">
                                {/* Photo Capture */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md group cursor-pointer">
                                        {formData.photo_url ? (
                                            <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                                        ) : isWebcamOpen ? (
                                            <Webcam
                                                audio={false}
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={48} />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium gap-2">
                                            <button
                                                type="button"
                                                disabled={isUploadingPhoto}
                                                onClick={() => {
                                                    if (isWebcamOpen) capturePhoto();
                                                    else setIsWebcamOpen(true);
                                                }}
                                                className="p-2 hover:bg-white/20 rounded-full disabled:opacity-50"
                                                title="Take a photo"
                                            >
                                                <Camera size={24} />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isUploadingPhoto}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 hover:bg-white/20 rounded-full disabled:opacity-50"
                                                title="Upload an image"
                                            >
                                                <Upload size={24} />
                                            </button>
                                        </div>
                                        {isUploadingPhoto && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                                <Loader2 className="animate-spin text-white" size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                {/* Identity */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.employees.form.firstName} <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none"
                                                placeholder="Ex: Jean"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.employees.form.lastName} <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none"
                                                placeholder="Ex: KOUASSI"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.employees.form.jobTitle}</label>
                                        <input
                                            type="text"
                                            value={formData.job_title}
                                            onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none"
                                            placeholder={t.employees.form.jobPlaceholder}
                                        />
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.employees.form.whatsapp}</label>
                                        <div className="relative flex gap-2">
                                            <div className="w-1/3 relative">
                                                <select
                                                    value={formData.phone_code}
                                                    onChange={e => setFormData({ ...formData, phone_code: e.target.value })}
                                                    className="w-full pl-3 pr-8 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none bg-white appearance-none"
                                                >
                                                    <option value="+241">🇬🇦 +241</option>
                                                    <option value="+33">🇫🇷 +33</option>
                                                    <option value="+1">🇺🇸 +1</option>
                                                    <option value="+221">🇸🇳 +221</option>
                                                    <option value="+225">🇨🇮 +225</option>
                                                    <option value="+237">🇨🇲 +237</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                    ▼
                                                </div>
                                            </div>
                                            <div className="relative flex-1">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="tel"
                                                    value={formData.whatsapp}
                                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none"
                                                    placeholder="074000000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.employees.form.email}</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none"
                                                placeholder="jean@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Access & Security */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.employees.form.assignedSite}</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                value={formData.site_id}
                                                onChange={e => setFormData({ ...formData, site_id: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none bg-white"
                                            >
                                                <option value="">{t.employees.form.unassigned}</option>
                                                {sites?.map(site => (
                                                    <option key={site.id} value={site.id}>{site.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.employees.form.pinCode}</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.pin}
                                                onChange={e => setFormData({ ...formData, pin: e.target.value })}
                                                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none font-mono text-lg tracking-widest text-center"
                                                placeholder="0000"
                                                maxLength={4}
                                            />
                                            <button
                                                type="button"
                                                onClick={generatePin}
                                                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                title="Generate new PIN"
                                            >
                                                <RefreshCw size={20} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{t.employees.form.pinDesc}</p>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="pt-4 flex items-center gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={closeDrawer}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {t.employees.form.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-3 bg-[#0F4C5C] text-white rounded-lg font-bold hover:bg-[#0a3641] transition-colors shadow-sm flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" /> : t.employees.form.save}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Badge Modal */}
            {badgeEmployee && (
                <div id="printable-badge-modal" className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                        {/* Printable Area */}
                        <div className="p-0 bg-white flex flex-col items-center text-center relative overflow-hidden">
                            {/* Header */}
                            <div className="w-full bg-[#0F4C5C] p-6 text-white relative">
                                <h2 className="text-2xl font-bold m-0">Timmy</h2>
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                                    {badgeEmployee.avatar_url ? (
                                        <Image src={badgeEmployee.avatar_url} alt="Avatar" width={96} height={96} className="w-full h-full rounded-full object-cover bg-gray-100" unoptimized />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-3xl">👤</div>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="pt-14 pb-8 px-6 w-full">
                                <h1 className="text-2xl font-bold text-gray-900">{badgeEmployee.first_name} {badgeEmployee.last_name}</h1>
                                <p className="text-gray-500 font-medium mb-6">{badgeEmployee.job_title || t.employees.badge.role}</p>

                                {/* QR Code */}
                                <div className="mb-6 flex justify-center">
                                    <div className="p-3 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                                        <QRCode
                                            value={badgeEmployee.id}
                                            size={140}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                                    {companyName}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="w-full bg-gray-50 p-3 border-t border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider">
                                {t.employees.badge.accessBadge}
                            </div>
                        </div>

                        {/* Actions (Hidden on Print) */}
                        <div className="p-4 border-t border-gray-100 flex gap-3 bg-white no-print">
                            <button
                                onClick={() => setBadgeEmployee(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {t.employees.badge.cancel}
                            </button>
                            <button
                                onClick={handlePrintBadge}
                                className="flex-1 px-4 py-2 bg-[#0F4C5C] text-white font-bold rounded-lg hover:bg-[#0a3642] transition-colors flex items-center justify-center gap-2"
                            >
                                <Printer size={18} />
                                {t.employees.badge.print}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
