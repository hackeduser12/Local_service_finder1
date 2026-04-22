import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Search, Home, Calendar, MessageCircle, User, Bell, Star, MapPin, Phone,
  Zap, Wrench, Hammer, BookOpen, Sparkles, Snowflake, Paintbrush, Cog, ChefHat, Shield,
  CheckCircle2, XCircle, Clock, ChevronRight, ChevronLeft, Filter, Camera, Upload,
  ArrowLeft, LogOut, Edit3, Wallet, TrendingUp, BarChart3, Send, Plus, Briefcase,
  ShieldCheck, X, Check, IndianRupee, Award, Eye,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as ReTooltip, CartesianGrid,
} from "recharts";

/* =========================================================
   TYPES & MOCK DATA
   ========================================================= */

type Role = "customer" | "provider";
type BookingStatus = "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";

interface Review {
  id: string;
  reviewer: string;
  stars: number;
  comment: string;
  date: string;
}
interface Provider {
  id: string;
  name: string;
  phone: string;
  password: string;
  city: string;
  category: string;
  bio: string;
  experience: number;
  rating: number;
  distance: number;
  priceMin: number;
  priceMax: number;
  priceUnit: "hr" | "visit";
  verified: boolean;
  available: boolean;
  reviews: Review[];
  skills: string[];
  serviceArea: string;
  avatarColor: string;
}
interface Customer {
  id: string;
  name: string;
  phone: string;
  password: string;
  email: string;
  city: string;
  avatarColor: string;
}
interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  service: string;
  date: string;
  slot: string;
  description: string;
  status: BookingStatus;
  price: number;
  createdAt: number;
  reviewed?: boolean;
  address?: string;
}
interface Message {
  id: string;
  from: string; // userId
  to: string;
  text: string;
  time: string;
  ts: number;
}
interface Notification {
  id: string;
  userId: string;
  text: string;
  time: string;
  read: boolean;
  type: "booking" | "review" | "system" | "chat";
}

const CATEGORIES = [
  { name: "Electrician", icon: Zap, color: "bg-warning-soft text-warning" },
  { name: "Plumber", icon: Wrench, color: "bg-info-soft text-info" },
  { name: "Carpenter", icon: Hammer, color: "bg-accent-soft text-accent" },
  { name: "Tutor", icon: BookOpen, color: "bg-primary-soft text-primary" },
  { name: "Cleaner", icon: Sparkles, color: "bg-success-soft text-success" },
  { name: "AC Repair", icon: Snowflake, color: "bg-info-soft text-info" },
  { name: "Painter", icon: Paintbrush, color: "bg-accent-soft text-accent" },
  { name: "Mechanic", icon: Cog, color: "bg-warning-soft text-warning" },
  { name: "Cook", icon: ChefHat, color: "bg-accent-soft text-accent" },
  { name: "Security Guard", icon: Shield, color: "bg-primary-soft text-primary" },
];

const AVATAR_COLORS = [
  "bg-gradient-to-br from-primary to-accent",
  "bg-gradient-to-br from-info to-primary",
  "bg-gradient-to-br from-accent to-warning",
  "bg-gradient-to-br from-success to-info",
  "bg-gradient-to-br from-warning to-accent",
  "bg-gradient-to-br from-primary to-info",
];

const seedReviews = (names: string[]): Review[] =>
  names.map((n, i) => ({
    id: `r${Math.random().toString(36).slice(2, 8)}`,
    reviewer: n,
    stars: 4 + ((i + 1) % 2),
    comment: [
      "Excellent work, very professional and on time!",
      "Solved the issue quickly. Highly recommended.",
      "Polite, skilled and reasonably priced. Will book again.",
    ][i % 3],
    date: ["2 days ago", "1 week ago", "3 weeks ago"][i % 3],
  }));

const initialProviders: Provider[] = [
  {
    id: "p1", name: "Ramesh Kumar", phone: "9000000001", password: "1234", city: "Prayagraj",
    category: "Electrician", bio: "12+ years of experience in home & commercial wiring, repairs and installations.",
    experience: 12, rating: 4.8, distance: 1.2, priceMin: 200, priceMax: 400, priceUnit: "hr",
    verified: true, available: true, skills: ["Wiring", "Switch Repair", "Fan Install", "MCB"],
    serviceArea: "Civil Lines, Prayagraj (5 km radius)", avatarColor: AVATAR_COLORS[0],
    reviews: seedReviews(["Rahul Verma", "Meena Joshi", "Vikram Singh"]),
  },
  {
    id: "p2", name: "Sunil Sharma", phone: "9000000002", password: "1234", city: "Prayagraj",
    category: "Plumber", bio: "Expert plumber specializing in leak repair, pipe fitting and bathroom installations.",
    experience: 8, rating: 4.5, distance: 0.8, priceMin: 150, priceMax: 300, priceUnit: "hr",
    verified: true, available: true, skills: ["Leak Repair", "Pipe Fitting", "Tap Install"],
    serviceArea: "Katra, Prayagraj", avatarColor: AVATAR_COLORS[1],
    reviews: seedReviews(["Aarti Mehra", "Suresh Kumar", "Pooja Patel"]),
  },
  {
    id: "p3", name: "Anita Singh", phone: "9000000003", password: "1234", city: "Prayagraj",
    category: "Tutor", bio: "Math tutor for classes 6-12. CBSE & ICSE syllabus. Patient and friendly approach.",
    experience: 6, rating: 4.9, distance: 2.1, priceMin: 300, priceMax: 500, priceUnit: "hr",
    verified: true, available: true, skills: ["Math", "Algebra", "Geometry", "Calculus"],
    serviceArea: "George Town, Prayagraj", avatarColor: AVATAR_COLORS[2],
    reviews: seedReviews(["Rohan Das", "Sneha Gupta", "Karan Mehta"]),
  },
  {
    id: "p4", name: "Mukesh Yadav", phone: "9000000004", password: "1234", city: "Prayagraj",
    category: "AC Repair", bio: "AC service & repair for all brands. Gas refilling, deep cleaning included.",
    experience: 5, rating: 4.3, distance: 3.4, priceMin: 350, priceMax: 600, priceUnit: "visit",
    verified: false, available: false, skills: ["AC Service", "Gas Refill", "Installation"],
    serviceArea: "Naini, Prayagraj", avatarColor: AVATAR_COLORS[3],
    reviews: seedReviews(["Deepak Rao", "Nisha Bansal", "Amit Khan"]),
  },
  {
    id: "p5", name: "Priya Gupta", phone: "9000000005", password: "1234", city: "Prayagraj",
    category: "Cleaner", bio: "Professional house cleaner. Deep cleaning, kitchen & bathroom specialist.",
    experience: 4, rating: 4.7, distance: 1.5, priceMin: 200, priceMax: 350, priceUnit: "visit",
    verified: true, available: true, skills: ["Deep Clean", "Kitchen", "Bathroom"],
    serviceArea: "Allahpur, Prayagraj", avatarColor: AVATAR_COLORS[4],
    reviews: seedReviews(["Manish Tiwari", "Ritu Saxena", "Geeta Sharma"]),
  },
  {
    id: "p6", name: "Arun Patel", phone: "9000000006", password: "1234", city: "Prayagraj",
    category: "Carpenter", bio: "Custom furniture, repairs, modular kitchen work. 10 years experience.",
    experience: 10, rating: 4.2, distance: 4.0, priceMin: 250, priceMax: 450, priceUnit: "hr",
    verified: false, available: true, skills: ["Furniture", "Repair", "Modular"],
    serviceArea: "Jhusi, Prayagraj", avatarColor: AVATAR_COLORS[5],
    reviews: seedReviews(["Vivek Anand", "Shalini Roy", "Mohit Jain"]),
  },
];

const initialCustomers: Customer[] = [
  { id: "c1", name: "Rahul Verma", phone: "8000000001", password: "1234", email: "rahul@email.com", city: "Prayagraj", avatarColor: AVATAR_COLORS[0] },
  { id: "c2", name: "Meena Joshi", phone: "8000000002", password: "1234", email: "meena@email.com", city: "Prayagraj", avatarColor: AVATAR_COLORS[2] },
  { id: "c3", name: "Vikram Singh", phone: "8000000003", password: "1234", email: "vikram@email.com", city: "Prayagraj", avatarColor: AVATAR_COLORS[3] },
];

const initialBookings: Booking[] = [
  { id: "b1", customerId: "c1", providerId: "p1", service: "Electrician", date: "Tomorrow", slot: "10:00 AM", description: "Fan not working in bedroom", status: "Pending", price: 300, createdAt: Date.now() - 1000 * 60 * 60, address: "12, Civil Lines, Prayagraj" },
  { id: "b2", customerId: "c1", providerId: "p2", service: "Plumber", date: "Last week", slot: "2:00 PM", description: "Kitchen sink leak fixed", status: "Completed", price: 250, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, reviewed: true, address: "12, Civil Lines, Prayagraj" },
  { id: "b3", customerId: "c2", providerId: "p1", service: "Electrician", date: "Today", slot: "4:00 PM", description: "MCB tripping repeatedly", status: "In Progress", price: 350, createdAt: Date.now() - 1000 * 60 * 30, address: "5, George Town, Prayagraj" },
];

const initialMessages: Message[] = [
  { id: "m1", from: "c1", to: "p1", text: "Hi, are you available tomorrow morning?", time: "10:30 AM", ts: Date.now() - 1000 * 60 * 60 * 3 },
  { id: "m2", from: "p1", to: "c1", text: "Yes, I can come at 10 AM. Will that work?", time: "10:32 AM", ts: Date.now() - 1000 * 60 * 60 * 3 + 60000 },
  { id: "m3", from: "c1", to: "p1", text: "Perfect, see you then!", time: "10:33 AM", ts: Date.now() - 1000 * 60 * 60 * 3 + 120000 },
  { id: "m4", from: "c2", to: "p1", text: "How long will the MCB repair take?", time: "3:45 PM", ts: Date.now() - 1000 * 60 * 30 },
  { id: "m5", from: "p1", to: "c2", text: "About an hour. On my way now.", time: "3:50 PM", ts: Date.now() - 1000 * 60 * 25 },
];

const initialNotifications: Notification[] = [
  { id: "n1", userId: "c1", text: "Your booking with Ramesh Kumar is pending confirmation.", time: "1h ago", read: false, type: "booking" },
  { id: "n2", userId: "c1", text: "Please rate your recent service with Sunil Sharma.", time: "2d ago", read: false, type: "review" },
  { id: "n3", userId: "c1", text: "Welcome to सेवा Finder! Explore services near you.", time: "3d ago", read: true, type: "system" },
  { id: "n4", userId: "p1", text: "New booking request from Rahul Verma.", time: "1h ago", read: false, type: "booking" },
  { id: "n5", userId: "p1", text: "Meena Joshi sent you a message.", time: "30m ago", read: false, type: "chat" },
];

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* =========================================================
   HELPERS
   ========================================================= */

const uid = () => Math.random().toString(36).slice(2, 10);
const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const statusBadge = (status: BookingStatus) => {
  const map: Record<BookingStatus, string> = {
    Pending: "bg-warning-soft text-warning",
    Confirmed: "bg-info-soft text-info",
    "In Progress": "bg-primary-soft text-primary",
    Completed: "bg-success-soft text-success",
    Cancelled: "bg-destructive-soft text-destructive",
  };
  return map[status];
};

/* =========================================================
   SHARED UI COMPONENTS
   ========================================================= */

const Avatar = ({ name, color, size = "md" }: { name: string; color: string; size?: "sm" | "md" | "lg" | "xl" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base", xl: "w-24 h-24 text-2xl" };
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-card`}>
      {initials(name)}
    </div>
  );
};

const Stars = ({ value, size = 14 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} className={i <= Math.round(value) ? "fill-warning text-warning" : "text-muted-foreground/30"} />
    ))}
  </div>
);

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>
);

const PageHeader = ({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) => (
  <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
    {onBack && (
      <button onClick={onBack} className="p-1.5 rounded-full hover:bg-muted transition" aria-label="Back">
        <ArrowLeft size={20} />
      </button>
    )}
    <h1 className="font-bold text-lg flex-1 truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
    {right}
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center mb-3">
      <Icon className="text-primary" size={28} />
    </div>
    <h3 className="font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
  </div>
);

/* =========================================================
   MAIN APP
   ========================================================= */

export default function Index() {
  // Global state (would normally be context, kept in root for simplicity)
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("customer");

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    if (role === "customer") return customers.find((c) => c.id === currentUserId) || null;
    return providers.find((p) => p.id === currentUserId) || null;
  }, [currentUserId, role, customers, providers]);

  const handleLogin = (phone: string, password: string, selectedRole: Role) => {
    const list = selectedRole === "customer" ? customers : providers;
    const user = list.find((u) => u.phone === phone && u.password === password);
    if (user) {
      setCurrentUserId(user.id);
      setRole(selectedRole);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
    } else {
      toast.error("Invalid phone or password. Try the demo accounts shown.");
    }
  };

  const handleRegister = (data: { name: string; phone: string; city: string; password: string }, selectedRole: Role) => {
    const exists = (selectedRole === "customer" ? customers : providers).some((u) => u.phone === data.phone);
    if (exists) { toast.error("Phone number already registered."); return; }
    const id = uid();
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    if (selectedRole === "customer") {
      const newC: Customer = { id, ...data, email: `${data.name.split(" ")[0].toLowerCase()}@email.com`, avatarColor };
      setCustomers((s) => [...s, newC]);
    } else {
      const newP: Provider = {
        id, ...data, category: "Electrician", bio: "New service provider on सेवा Finder.",
        experience: 1, rating: 0, distance: 2, priceMin: 200, priceMax: 400, priceUnit: "hr",
        verified: false, available: true, reviews: [], skills: [], serviceArea: data.city, avatarColor,
      };
      setProviders((s) => [...s, newP]);
    }
    setCurrentUserId(id);
    setRole(selectedRole);
    toast.success("Account created! Welcome to सेवा Finder.");
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    toast("Logged out");
  };

  // ---------- BOOKING ACTIONS ----------
  const createBooking = (b: Omit<Booking, "id" | "createdAt" | "status">) => {
    const newB: Booking = { ...b, id: uid(), createdAt: Date.now(), status: "Pending" };
    setBookings((s) => [newB, ...s]);
    const provider = providers.find((p) => p.id === b.providerId);
    setNotifications((n) => [
      { id: uid(), userId: b.providerId, text: `New booking request for ${b.service}.`, time: "Just now", read: false, type: "booking" },
      { id: uid(), userId: b.customerId, text: `Booking placed with ${provider?.name}.`, time: "Just now", read: false, type: "booking" },
      ...n,
    ]);
    toast.success("Booking confirmed! Awaiting provider response.");
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings((s) => s.map((b) => (b.id === id ? { ...b, status } : b)));
    const b = bookings.find((x) => x.id === id);
    if (b) {
      const provider = providers.find((p) => p.id === b.providerId);
      setNotifications((n) => [
        { id: uid(), userId: b.customerId, text: `Booking ${status.toLowerCase()} by ${provider?.name}.`, time: "Just now", read: false, type: "booking" },
        ...n,
      ]);
    }
    toast.success(`Booking marked as ${status}`);
  };

  const submitReview = (bookingId: string, providerId: string, stars: number, comment: string) => {
    const customer = customers.find((c) => c.id === currentUserId);
    if (!customer) return;
    const review: Review = { id: uid(), reviewer: customer.name, stars, comment, date: "Just now" };
    setProviders((ps) =>
      ps.map((p) => {
        if (p.id !== providerId) return p;
        const newReviews = [review, ...p.reviews];
        const avg = newReviews.reduce((s, r) => s + r.stars, 0) / newReviews.length;
        return { ...p, reviews: newReviews, rating: Math.round(avg * 10) / 10 };
      })
    );
    setBookings((bs) => bs.map((b) => (b.id === bookingId ? { ...b, reviewed: true } : b)));
    toast.success("Thanks for your review!");
  };

  // ---------- CHAT ----------
  const sendMessage = (to: string, text: string) => {
    if (!currentUserId || !text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { id: uid(), from: currentUserId, to, text: text.trim(), time, ts: Date.now() }]);
  };

  // ---------- PROVIDER UPDATES ----------
  const updateProvider = (id: string, patch: Partial<Provider>) => {
    setProviders((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-accent-soft">
      <div className="max-w-sm mx-auto bg-background min-h-screen shadow-elegant relative overflow-hidden">
        {!currentUser ? (
          <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
        ) : role === "customer" ? (
          <CustomerApp
            user={currentUser as Customer}
            providers={providers}
            bookings={bookings.filter((b) => b.customerId === currentUserId)}
            allBookings={bookings}
            messages={messages}
            notifications={notifications.filter((n) => n.userId === currentUserId)}
            onLogout={handleLogout}
            createBooking={createBooking}
            updateBookingStatus={updateBookingStatus}
            submitReview={submitReview}
            sendMessage={sendMessage}
            markNotificationsRead={() =>
              setNotifications((n) => n.map((x) => (x.userId === currentUserId ? { ...x, read: true } : x)))
            }
          />
        ) : (
          <ProviderApp
            user={currentUser as Provider}
            customers={customers}
            bookings={bookings.filter((b) => b.providerId === currentUserId)}
            messages={messages}
            notifications={notifications.filter((n) => n.userId === currentUserId)}
            onLogout={handleLogout}
            updateBookingStatus={updateBookingStatus}
            sendMessage={sendMessage}
            updateProvider={updateProvider}
            markNotificationsRead={() =>
              setNotifications((n) => n.map((x) => (x.userId === currentUserId ? { ...x, read: true } : x)))
            }
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   AUTH SCREEN
   ========================================================= */

function AuthScreen({
  onLogin, onRegister,
}: {
  onLogin: (phone: string, password: string, role: Role) => void;
  onRegister: (data: { name: string; phone: string; city: string; password: string }, role: Role) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Prayagraj");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") onLogin(phone, password, role);
    else {
      if (!name || !phone || !password) { toast.error("Please fill all fields"); return; }
      onRegister({ name, phone, city, password }, role);
    }
  };

  const fillDemo = () => {
    if (role === "customer") { setPhone("8000000001"); setPassword("1234"); }
    else { setPhone("9000000001"); setPassword("1234"); }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-elegant mb-4">
          <Briefcase className="text-primary-foreground" size={28} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          सेवा <span className="text-primary">Finder</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Hyperlocal services, instantly.</p>
      </div>

      {/* Role toggle */}
      <div className="bg-muted rounded-full p-1 flex mb-6">
        {(["customer", "provider"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold capitalize transition ${
              role === r ? "bg-background shadow-card text-primary" : "text-muted-foreground"
            }`}
          >
            {r === "customer" ? "I need a service" : "I provide services"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
            className="w-full px-4 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />
        )}
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" inputMode="tel"
          className="w-full px-4 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />
        {mode === "register" && (
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
            className="w-full px-4 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />
        )}
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password"
          className="w-full px-4 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />

        <button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold py-3.5 rounded-full shadow-elegant hover:opacity-95 transition">
          {mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary font-medium">
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>

      <div className="mt-auto pt-8">
        <div className="bg-primary-soft rounded-2xl p-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-primary">Demo accounts</p>
            <button onClick={fillDemo} className="text-primary underline">Use demo</button>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Customer: <span className="font-mono">8000000001</span> / 1234<br />
            Provider: <span className="font-mono">9000000001</span> / 1234
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOMER APP
   ========================================================= */

type CustomerTab = "home" | "search" | "bookings" | "chat" | "profile";

function CustomerApp(props: {
  user: Customer;
  providers: Provider[];
  bookings: Booking[];
  allBookings: Booking[];
  messages: Message[];
  notifications: Notification[];
  onLogout: () => void;
  createBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  submitReview: (bookingId: string, providerId: string, stars: number, comment: string) => void;
  sendMessage: (to: string, text: string) => void;
  markNotificationsRead: () => void;
}) {
  const { user, providers, bookings, messages, notifications, onLogout, createBooking, updateBookingStatus, submitReview, sendMessage, markNotificationsRead } = props;
  const [tab, setTab] = useState<CustomerTab>("home");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [chatProvider, setChatProvider] = useState<Provider | null>(null);
  const [searchPreset, setSearchPreset] = useState<string>("");
  const [showNotifs, setShowNotifs] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const goSearch = (q: string) => { setSearchPreset(q); setTab("search"); };

  return (
    <div className="pb-20 min-h-screen">
      <TopHeader
        user={user}
        unread={unread}
        onBell={() => { setShowNotifs(true); markNotificationsRead(); }}
      />

      <div className="animate-fade-in">
        {tab === "home" && (
          <CustomerHome
            providers={providers}
            onCategory={(c) => goSearch(c)}
            onSearch={(q) => goSearch(q)}
            onProvider={(p) => setSelectedProvider(p)}
          />
        )}
        {tab === "search" && (
          <SearchPage providers={providers} preset={searchPreset} onProvider={(p) => setSelectedProvider(p)} />
        )}
        {tab === "bookings" && (
          <CustomerBookings
            bookings={bookings}
            providers={providers}
            onCancel={(id) => updateBookingStatus(id, "Cancelled")}
            onReview={(b) => setReviewBooking(b)}
            onChat={(pid) => { const p = providers.find((x) => x.id === pid); if (p) { setChatProvider(p); setTab("chat"); } }}
          />
        )}
        {tab === "chat" && (
          <ChatPage
            currentId={user.id}
            counterparts={providers.filter((p) => messages.some((m) => (m.from === user.id && m.to === p.id) || (m.from === p.id && m.to === user.id)))}
            messages={messages}
            sendMessage={sendMessage}
            initialOpen={chatProvider}
            onClose={() => setChatProvider(null)}
            getName={(id) => providers.find((p) => p.id === id)?.name || "Provider"}
            getColor={(id) => providers.find((p) => p.id === id)?.avatarColor || AVATAR_COLORS[0]}
          />
        )}
        {tab === "profile" && (
          <CustomerProfile user={user} bookings={bookings} onLogout={onLogout} />
        )}
      </div>

      <BottomNav tab={tab} setTab={(t) => { setTab(t); setChatProvider(null); }} />

      {/* Modals */}
      {selectedProvider && (
        <ProviderProfileModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onBook={() => { setBookingProvider(selectedProvider); setSelectedProvider(null); }}
          onChat={() => { setChatProvider(selectedProvider); setTab("chat"); setSelectedProvider(null); }}
        />
      )}
      {bookingProvider && (
        <BookingFlowModal
          provider={bookingProvider}
          customerId={user.id}
          onClose={() => setBookingProvider(null)}
          onConfirm={(payload) => { createBooking(payload); setBookingProvider(null); setTab("bookings"); }}
        />
      )}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          provider={providers.find((p) => p.id === reviewBooking.providerId)!}
          onClose={() => setReviewBooking(null)}
          onSubmit={(stars, comment) => { submitReview(reviewBooking.id, reviewBooking.providerId, stars, comment); setReviewBooking(null); }}
        />
      )}
      {showNotifs && (
        <NotificationsPanel notifications={notifications} onClose={() => setShowNotifs(false)} />
      )}
    </div>
  );
}

/* ----------- Top Header & Bottom Nav ----------- */

function TopHeader({ user, unread, onBell }: { user: any; unread: number; onBell: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-card">
        <Briefcase size={18} className="text-primary-foreground" />
      </div>
      <div className="flex-1">
        <h1 className="font-extrabold leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          सेवा <span className="text-primary">Finder</span>
        </h1>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin size={10} /> {user.city || "Prayagraj"}
        </p>
      </div>
      <button onClick={onBell} className="relative p-2 rounded-full hover:bg-muted transition" aria-label="Notifications">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      <Avatar name={user.name} color={user.avatarColor} size="sm" />
    </header>
  );
}

function BottomNav({ tab, setTab }: { tab: CustomerTab; setTab: (t: CustomerTab) => void }) {
  const items: { key: CustomerTab; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Home" },
    { key: "search", icon: Search, label: "Search" },
    { key: "bookings", icon: Calendar, label: "Bookings" },
    { key: "chat", icon: MessageCircle, label: "Chat" },
    { key: "profile", icon: User, label: "Profile" },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-sm w-full bg-background/95 backdrop-blur-md border-t border-border z-30">
      <div className="flex items-center justify-around py-2">
        {items.map((it) => {
          const active = tab === it.key;
          const Icon = it.icon;
          return (
            <button key={it.key} onClick={() => setTab(it.key)} className="flex flex-col items-center gap-0.5 py-1 px-3 transition">
              <div className={`p-1.5 rounded-xl transition ${active ? "bg-primary-soft" : ""}`}>
                <Icon size={20} className={active ? "text-primary" : "text-muted-foreground"} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ----------- Customer Home ----------- */

function CustomerHome({ providers, onCategory, onSearch, onProvider }: {
  providers: Provider[]; onCategory: (c: string) => void; onSearch: (q: string) => void; onProvider: (p: Provider) => void;
}) {
  const [q, setQ] = useState("");
  const featured = [...providers].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const nearby = [...providers].sort((a, b) => a.distance - b.distance).slice(0, 6);

  return (
    <div className="px-4 pt-4 pb-2 space-y-6">
      {/* Hero search */}
      <div>
        <h2 className="text-2xl font-extrabold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Find a service<br /><span className="text-primary">near you.</span>
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); onSearch(q); }} className="mt-3 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Find a service near you..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />
        </form>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Categories</h3>
          <button onClick={() => onSearch("")} className="text-xs text-primary font-medium">See all</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button key={c.name} onClick={() => onCategory(c.name)} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-14 h-14 rounded-2xl ${c.color} flex items-center justify-center group-hover:scale-105 transition shadow-card`}>
                  <Icon size={22} />
                </div>
                <span className="text-[10px] font-medium text-center leading-tight">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured carousel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-1.5"><Award size={14} className="text-warning" /> Top Rated</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {featured.map((p) => (
            <button key={p.id} onClick={() => onProvider(p)}
              className="shrink-0 w-44 bg-card rounded-2xl shadow-card p-3 text-left hover:shadow-elegant transition">
              <div className="relative">
                <Avatar name={p.name} color={p.avatarColor} size="lg" />
                {p.verified && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-info flex items-center justify-center border-2 border-card">
                    <Check size={10} className="text-info-foreground" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-sm mt-2 truncate">{p.name}</h4>
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <div className="flex items-center justify-between mt-2">
                <Stars value={p.rating} size={11} />
                <span className="text-xs font-semibold text-foreground">{p.rating}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Near you */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-1.5"><MapPin size={14} className="text-accent" /> Near You</h3>
        </div>
        <div className="space-y-2.5">
          {nearby.map((p) => <ProviderCard key={p.id} provider={p} onClick={() => onProvider(p)} />)}
        </div>
      </div>
    </div>
  );
}

/* ----------- Provider Card ----------- */

function ProviderCard({ provider, onClick }: { provider: Provider; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-card rounded-2xl shadow-card p-3 flex items-center gap-3 hover:shadow-elegant transition text-left">
      <div className="relative">
        <Avatar name={provider.name} color={provider.avatarColor} size="lg" />
        {provider.verified && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-info flex items-center justify-center border-2 border-card">
            <Check size={10} className="text-info-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate">{provider.name}</h4>
          {provider.available && <span className="w-2 h-2 rounded-full bg-success" />}
        </div>
        <p className="text-xs text-muted-foreground">{provider.category}</p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Star size={11} className="fill-warning text-warning" />{provider.rating}</span>
          <span>•</span>
          <span className="flex items-center gap-0.5"><MapPin size={10} />{provider.distance}km</span>
          <span>•</span>
          <span className="font-semibold text-foreground">₹{provider.priceMin}/{provider.priceUnit}</span>
        </div>
      </div>
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
  );
}

/* ----------- Search Page ----------- */

function SearchPage({ providers, preset, onProvider }: { providers: Provider[]; preset: string; onProvider: (p: Provider) => void }) {
  const [q, setQ] = useState(preset);
  useEffect(() => { setQ(preset); }, [preset]);
  const [category, setCategory] = useState<string>(CATEGORIES.some((c) => c.name === preset) ? preset : "");
  const [distance, setDistance] = useState<number>(15);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(700);
  const [availability, setAvailability] = useState<"any" | "now">("any");
  const [sort, setSort] = useState<"nearest" | "rating" | "price">("nearest");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    let r = providers.filter((p) => {
      const qMatch = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase());
      const cMatch = !category || p.category === category;
      const dMatch = p.distance <= distance;
      const rMatch = p.rating >= minRating;
      const pMatch = p.priceMin <= maxPrice;
      const aMatch = availability === "any" || p.available;
      return qMatch && cMatch && dMatch && rMatch && pMatch && aMatch;
    });
    if (sort === "nearest") r = r.sort((a, b) => a.distance - b.distance);
    if (sort === "rating") r = r.sort((a, b) => b.rating - a.rating);
    if (sort === "price") r = r.sort((a, b) => a.priceMin - b.priceMin);
    return r;
  }, [providers, q, category, distance, minRating, maxPrice, availability, sort]);

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search providers or services..."
          className="w-full pl-10 pr-12 py-3 rounded-full bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />
        <button onClick={() => setShowFilters((s) => !s)}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full transition ${showFilters ? "bg-primary text-primary-foreground" : "bg-background"}`}>
          <Filter size={16} />
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        <button onClick={() => setCategory("")}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${!category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.name} onClick={() => setCategory(c.name)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${category === c.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="bg-card rounded-2xl shadow-card p-4 space-y-4 animate-fade-in">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Distance: within {distance}km</label>
            <div className="flex gap-2 mt-2">
              {[1, 5, 10, 15].map((d) => (
                <button key={d} onClick={() => setDistance(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${distance === d ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {d === 15 ? "10+km" : `${d}km`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Minimum rating</label>
            <div className="flex gap-2 mt-2">
              {[0, 3, 4, 4.5].map((r) => (
                <button key={r} onClick={() => setMinRating(r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${minRating === r ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {r === 0 ? "Any" : `${r}+`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Max price: ₹{maxPrice}</label>
            <input type="range" min={100} max={700} step={50} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Availability</label>
            <div className="flex gap-2 mt-2">
              {(["any", "now"] as const).map((a) => (
                <button key={a} onClick={() => setAvailability(a)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${availability === a ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {a === "any" ? "Any time" : "Available now"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{results.length} provider{results.length !== 1 ? "s" : ""} found</p>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}
          className="text-xs bg-muted rounded-full px-3 py-1.5 font-semibold outline-none">
          <option value="nearest">Nearest</option>
          <option value="rating">Top Rated</option>
          <option value="price">Price: Low → High</option>
        </select>
      </div>

      <div className="space-y-2.5">
        {results.length === 0 ? (
          <EmptyState icon={Search} title="No providers found" subtitle="Try adjusting your filters" />
        ) : (
          results.map((p) => <ProviderCard key={p.id} provider={p} onClick={() => onProvider(p)} />)
        )}
      </div>
    </div>
  );
}

/* ----------- Provider Profile Modal ----------- */

function ProviderProfileModal({ provider, onClose, onBook, onChat }: {
  provider: Provider; onClose: () => void; onBook: () => void; onChat: () => void;
}) {
  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // 5..1
    provider.reviews.forEach((r) => { counts[5 - r.stars]++; });
    const total = provider.reviews.length || 1;
    return counts.map((c) => Math.round((c / total) * 100));
  }, [provider]);

  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 animate-fade-in">
      <div className="bg-background w-full max-w-sm md:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-elegant relative">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted"><X size={20} /></button>
          <span className="font-semibold text-sm">Provider Profile</span>
          <div className="w-8" />
        </div>

        <div className="p-5 text-center">
          <div className="relative inline-block">
            <Avatar name={provider.name} color={provider.avatarColor} size="xl" />
            {provider.verified && (
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-info flex items-center justify-center border-2 border-background">
                <Check size={14} className="text-info-foreground" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-extrabold mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{provider.name}</h2>
          <p className="text-sm text-muted-foreground">{provider.category} • {provider.experience} yrs exp</p>
          {provider.verified && (
            <Badge className="bg-info-soft text-info mt-2"><ShieldCheck size={12} /> Verified</Badge>
          )}
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1"><Star size={14} className="fill-warning text-warning" /><span className="font-bold">{provider.rating}</span><span className="text-muted-foreground">({provider.reviews.length})</span></div>
            <div className="flex items-center gap-1 text-muted-foreground"><MapPin size={12} />{provider.distance}km</div>
            <div className="flex items-center gap-1 text-muted-foreground"><IndianRupee size={12} />{provider.priceMin}-{provider.priceMax}/{provider.priceUnit}</div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{provider.bio}</p>

          {provider.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {provider.skills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-muted rounded-full text-[11px] font-medium">{s}</span>
              ))}
            </div>
          )}

          {/* Rating breakdown */}
          <div className="bg-card rounded-2xl shadow-card p-4">
            <h3 className="font-bold text-sm mb-3">Rating breakdown</h3>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{s}</span>
                  <Star size={11} className="fill-warning text-warning" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-warning" style={{ width: `${breakdown[i]}%` }} />
                  </div>
                  <span className="w-9 text-right text-muted-foreground">{breakdown[i]}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-card rounded-2xl shadow-card p-4">
            <h3 className="font-bold text-sm mb-3">Weekly availability</h3>
            <div className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((d, i) => {
                const slots = (i + provider.id.charCodeAt(1)) % 5 + 1;
                return (
                  <div key={d} className="text-center">
                    <div className="text-[10px] text-muted-foreground mb-1">{d}</div>
                    <div className={`rounded-lg py-1.5 text-[10px] font-semibold ${slots > 2 ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
                      {slots}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Numbers indicate available slots per day</p>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="font-bold text-sm mb-3">Reviews ({provider.reviews.length})</h3>
            <div className="space-y-2.5">
              {provider.reviews.map((r) => (
                <div key={r.id} className="bg-card rounded-2xl shadow-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{r.reviewer}</div>
                    <Stars value={r.stars} size={12} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{r.comment}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{r.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border p-3 flex gap-2">
          <button onClick={() => toast(`Calling ${provider.phone}...`)} className="p-3 rounded-full bg-muted hover:bg-secondary transition" aria-label="Call">
            <Phone size={18} />
          </button>
          <button onClick={onChat} className="p-3 rounded-full bg-muted hover:bg-secondary transition" aria-label="Chat">
            <MessageCircle size={18} />
          </button>
          <button onClick={onBook} className="flex-1 gradient-primary text-primary-foreground font-semibold rounded-full py-3 shadow-elegant">
            📅 Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------- Booking Flow Modal ----------- */

function BookingFlowModal({ provider, customerId, onClose, onConfirm }: {
  provider: Provider; customerId: string; onClose: () => void;
  onConfirm: (b: Omit<Booking, "id" | "createdAt" | "status">) => void;
}) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState(false);
  const [address, setAddress] = useState("12, Civil Lines, Prayagraj");

  const dates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      return { key: d.toDateString(), label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) };
    });
  }, []);

  const price = Math.round((provider.priceMin + provider.priceMax) / 2);

  const next = () => {
    if (step === 1 && (!date || !slot)) { toast.error("Please pick a date and time"); return; }
    if (step === 2 && !desc.trim()) { toast.error("Please describe the issue"); return; }
    if (step < 3) setStep(step + 1);
    else onConfirm({ customerId, providerId: provider.id, service: provider.category, date, slot, description: desc, price, address });
  };

  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-background w-full max-w-sm md:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-elegant">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="p-1.5 rounded-full hover:bg-muted">
            {step === 1 ? <X size={20} /> : <ArrowLeft size={20} />}
          </button>
          <span className="font-semibold text-sm">Book {provider.category}</span>
          <div className="w-8" />
        </div>

        {/* Progress */}
        <div className="px-4 pt-4 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <p className="px-4 mt-2 text-xs text-muted-foreground">Step {step} of 3</p>

        <div className="p-4 space-y-4">
          {step === 1 && (
            <>
              <h3 className="font-bold">Pick date & time</h3>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
                {dates.map((d) => (
                  <button key={d.key} onClick={() => setDate(d.label)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition ${date === d.label ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button key={t} onClick={() => setSlot(t)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition ${slot === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h3 className="font-bold">Describe the problem</h3>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5}
                placeholder="E.g. Ceiling fan is making noise and rotating slowly..."
                className="w-full px-4 py-3 rounded-2xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Service address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />
              </div>
              <button onClick={() => { setPhoto(true); toast.success("Photo attached"); }}
                className={`w-full border-2 border-dashed rounded-2xl py-6 text-sm font-medium transition ${photo ? "border-success bg-success-soft text-success" : "border-border text-muted-foreground"}`}>
                {photo ? <span className="flex items-center justify-center gap-2"><Check size={16} /> Photo attached</span>
                       : <span className="flex items-center justify-center gap-2"><Camera size={16} /> Upload a photo (optional)</span>}
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <h3 className="font-bold">Confirm booking</h3>
              <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <Avatar name={provider.name} color={provider.avatarColor} size="md" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{provider.name}</div>
                    <div className="text-xs text-muted-foreground">{provider.category}</div>
                  </div>
                </div>
                <Row label="Date" value={date} />
                <Row label="Time" value={slot} />
                <Row label="Address" value={address} />
                <Row label="Issue" value={desc.length > 60 ? desc.slice(0, 60) + "…" : desc} />
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated total</span>
                  <span className="text-lg font-extrabold text-primary">₹{price}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">Final price may vary based on actual work.</p>
            </>
          )}
        </div>

        <div className="sticky bottom-0 p-3 bg-background/95 backdrop-blur-md border-t border-border">
          <button onClick={next} className="w-full gradient-primary text-primary-foreground font-semibold rounded-full py-3 shadow-elegant">
            {step === 3 ? "Confirm booking" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-3 text-sm">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);

/* ----------- Customer Bookings ----------- */

function CustomerBookings({ bookings, providers, onCancel, onReview, onChat }: {
  bookings: Booking[]; providers: Provider[]; onCancel: (id: string) => void;
  onReview: (b: Booking) => void; onChat: (pid: string) => void;
}) {
  const [tab, setTab] = useState<"active" | "completed" | "cancelled">("active");
  const filtered = bookings.filter((b) => {
    if (tab === "active") return ["Pending", "Confirmed", "In Progress"].includes(b.status);
    if (tab === "completed") return b.status === "Completed";
    return b.status === "Cancelled";
  });

  return (
    <div className="px-4 pt-4 pb-2">
      <h2 className="text-xl font-extrabold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Bookings</h2>
      <div className="bg-muted rounded-full p-1 flex mb-4">
        {(["active", "completed", "cancelled"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-xs font-semibold capitalize transition ${tab === t ? "bg-background shadow-card text-primary" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No bookings here" subtitle={`You have no ${tab} bookings yet.`} />
        ) : filtered.map((b) => {
          const p = providers.find((x) => x.id === b.providerId);
          if (!p) return null;
          return (
            <div key={b.id} className="bg-card rounded-2xl shadow-card p-3.5 animate-fade-in">
              <div className="flex items-start gap-3">
                <Avatar name={p.name} color={p.avatarColor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">{b.service}</p>
                    </div>
                    <Badge className={statusBadge(b.status)}>{b.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={11} />{b.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{b.slot}</span>
                    <span>•</span>
                    <span className="font-semibold text-foreground">₹{b.price}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => onChat(p.id)} className="flex-1 py-2 rounded-lg bg-muted text-xs font-semibold flex items-center justify-center gap-1">
                  <MessageCircle size={12} /> Chat
                </button>
                {b.status === "Pending" && (
                  <button onClick={() => onCancel(b.id)} className="flex-1 py-2 rounded-lg bg-destructive-soft text-destructive text-xs font-semibold">
                    Cancel
                  </button>
                )}
                {b.status === "Completed" && !b.reviewed && (
                  <button onClick={() => onReview(b)} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">
                    ⭐ Rate & Review
                  </button>
                )}
                {b.status === "Completed" && b.reviewed && (
                  <span className="flex-1 py-2 rounded-lg bg-success-soft text-success text-xs font-semibold text-center">✓ Reviewed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------- Review Modal ----------- */

function ReviewModal({ booking, provider, onClose, onSubmit }: {
  booking: Booking; provider: Provider; onClose: () => void; onSubmit: (stars: number, comment: string) => void;
}) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-background w-full max-w-sm rounded-3xl shadow-elegant p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Rate your experience</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted"><X size={18} /></button>
        </div>
        <div className="text-center py-3">
          <Avatar name={provider.name} color={provider.avatarColor} size="lg" />
          <h4 className="font-semibold mt-2">{provider.name}</h4>
          <p className="text-xs text-muted-foreground">{booking.service}</p>
        </div>
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setStars(i)}>
              <Star size={32} className={i <= stars ? "fill-warning text-warning" : "text-muted-foreground/30"} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
          placeholder="Share your experience..."
          className="w-full px-4 py-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
        <button onClick={() => { if (!comment.trim()) { toast.error("Please add a comment"); return; } onSubmit(stars, comment); }}
          className="w-full mt-3 gradient-primary text-primary-foreground font-semibold rounded-full py-3 shadow-elegant">
          Submit review
        </button>
      </div>
    </div>
  );
}

/* ----------- Chat Page (shared) ----------- */

function ChatPage({ currentId, counterparts, messages, sendMessage, initialOpen, onClose, getName, getColor }: {
  currentId: string;
  counterparts: { id: string; name: string; avatarColor: string }[];
  messages: Message[];
  sendMessage: (to: string, text: string) => void;
  initialOpen: { id: string; name: string; avatarColor: string } | null;
  onClose: () => void;
  getName: (id: string) => string;
  getColor: (id: string) => string;
}) {
  const [openId, setOpenId] = useState<string | null>(initialOpen?.id || null);
  useEffect(() => { if (initialOpen) setOpenId(initialOpen.id); }, [initialOpen]);

  if (openId) {
    const thread = messages
      .filter((m) => (m.from === currentId && m.to === openId) || (m.from === openId && m.to === currentId))
      .sort((a, b) => a.ts - b.ts);
    return <ChatThread currentId={currentId} otherId={openId} thread={thread} onBack={() => { setOpenId(null); onClose(); }}
      sendMessage={sendMessage} otherName={getName(openId)} otherColor={getColor(openId)} />;
  }

  return (
    <div className="px-4 pt-4 pb-2">
      <h2 className="text-xl font-extrabold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Messages</h2>
      {counterparts.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet" subtitle="Start chatting with a provider from their profile." />
      ) : (
        <div className="space-y-2">
          {counterparts.map((c) => {
            const last = messages
              .filter((m) => (m.from === currentId && m.to === c.id) || (m.from === c.id && m.to === currentId))
              .sort((a, b) => b.ts - a.ts)[0];
            return (
              <button key={c.id} onClick={() => setOpenId(c.id)}
                className="w-full bg-card rounded-2xl shadow-card p-3 flex items-center gap-3 hover:shadow-elegant transition text-left">
                <Avatar name={c.name} color={c.avatarColor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{c.name}</h4>
                    <span className="text-[10px] text-muted-foreground">{last?.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{last?.text}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChatThread({ currentId, otherId, thread, onBack, sendMessage, otherName, otherColor }: {
  currentId: string; otherId: string; thread: Message[]; onBack: () => void;
  sendMessage: (to: string, text: string) => void; otherName: string; otherColor: string;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread.length]);

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]">
      <div className="sticky top-[60px] bg-background/95 backdrop-blur-md border-b border-border px-3 py-2 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-muted"><ArrowLeft size={18} /></button>
        <Avatar name={otherName} color={otherColor} size="sm" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{otherName}</h4>
          <p className="text-[10px] text-success">● Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/30">
        {thread.length === 0 && <p className="text-xs text-muted-foreground text-center mt-8">Say hello 👋</p>}
        {thread.map((m) => {
          const mine = m.from === currentId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${mine ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-card shadow-card text-foreground rounded-bl-sm"}`}>
                <p className="text-sm">{m.text}</p>
                <p className={`text-[10px] mt-0.5 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { sendMessage(otherId, text); setText(""); } }}
        className="p-3 border-t border-border bg-background flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm" />
        <button type="submit" className="w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-card">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

/* ----------- Notifications Panel ----------- */

function NotificationsPanel({ notifications, onClose }: { notifications: Notification[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-background w-full max-w-sm rounded-3xl shadow-elegant max-h-[70vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between sticky top-0 bg-background">
          <h3 className="font-bold">Notifications</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted"><X size={18} /></button>
        </div>
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="All caught up" subtitle="You have no new notifications." />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 flex gap-3 hover:bg-muted/50 transition">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  n.type === "booking" ? "bg-primary-soft text-primary" :
                  n.type === "review" ? "bg-warning-soft text-warning" :
                  n.type === "chat" ? "bg-info-soft text-info" : "bg-muted text-muted-foreground"
                }`}>
                  {n.type === "booking" ? <Calendar size={16} /> : n.type === "review" ? <Star size={16} /> : n.type === "chat" ? <MessageCircle size={16} /> : <Bell size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-snug">{n.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------- Customer Profile ----------- */

function CustomerProfile({ user, bookings, onLogout }: { user: Customer; bookings: Booking[]; onLogout: () => void }) {
  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <div className="bg-card rounded-2xl shadow-card p-5 text-center">
        <Avatar name={user.name} color={user.avatarColor} size="xl" />
        <h2 className="font-extrabold text-xl mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><MapPin size={11} />{user.city}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Total" value={bookings.length} />
        <StatCard label="Done" value={bookings.filter((b) => b.status === "Completed").length} />
        <StatCard label="Active" value={bookings.filter((b) => ["Pending", "Confirmed", "In Progress"].includes(b.status)).length} />
      </div>

      <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
        {[
          { icon: User, label: "Edit profile" },
          { icon: MapPin, label: "Saved addresses" },
          { icon: Wallet, label: "Payment methods" },
          { icon: Bell, label: "Notification settings" },
          { icon: Shield, label: "Privacy & security" },
        ].map((it) => (
          <button key={it.label} onClick={() => toast(`${it.label} coming soon`)}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-muted/50 transition">
            <it.icon size={18} className="text-primary" />
            <span className="flex-1 text-left text-sm font-medium">{it.label}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      <button onClick={onLogout} className="w-full bg-destructive-soft text-destructive font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2">
        <LogOut size={16} /> Log out
      </button>
    </div>
  );
}

const StatCard = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-card rounded-2xl shadow-card p-3 text-center">
    <div className="text-xl font-extrabold text-primary">{value}</div>
    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mt-0.5">{label}</div>
  </div>
);

/* =========================================================
   PROVIDER APP
   ========================================================= */

type ProviderTab = "home" | "bookings" | "earnings" | "chat" | "profile";

function ProviderApp(props: {
  user: Provider;
  customers: Customer[];
  bookings: Booking[];
  messages: Message[];
  notifications: Notification[];
  onLogout: () => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  sendMessage: (to: string, text: string) => void;
  updateProvider: (id: string, patch: Partial<Provider>) => void;
  markNotificationsRead: () => void;
}) {
  const { user, customers, bookings, messages, notifications, onLogout, updateBookingStatus, sendMessage, updateProvider, markNotificationsRead } = props;
  const [tab, setTab] = useState<ProviderTab>("home");
  const [showNotifs, setShowNotifs] = useState(false);
  const [chatCustomerId, setChatCustomerId] = useState<string | null>(null);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="pb-20 min-h-screen">
      <TopHeader user={user} unread={unread}
        onBell={() => { setShowNotifs(true); markNotificationsRead(); }} />

      <div className="animate-fade-in">
        {tab === "home" && (
          <ProviderHome user={user} bookings={bookings} updateProvider={updateProvider} />
        )}
        {tab === "bookings" && (
          <ProviderBookings bookings={bookings} customers={customers}
            onUpdate={(id, s) => updateBookingStatus(id, s)} />
        )}
        {tab === "earnings" && (
          <ProviderEarnings bookings={bookings} customers={customers} />
        )}
        {tab === "chat" && (
          <ChatPage
            currentId={user.id}
            counterparts={customers.filter((c) => messages.some((m) => (m.from === user.id && m.to === c.id) || (m.from === c.id && m.to === user.id)))}
            messages={messages}
            sendMessage={sendMessage}
            initialOpen={chatCustomerId ? customers.find((c) => c.id === chatCustomerId) || null : null}
            onClose={() => setChatCustomerId(null)}
            getName={(id) => customers.find((c) => c.id === id)?.name || "Customer"}
            getColor={(id) => customers.find((c) => c.id === id)?.avatarColor || AVATAR_COLORS[0]}
          />
        )}
        {tab === "profile" && (
          <ProviderProfileEdit user={user} updateProvider={updateProvider} onLogout={onLogout} />
        )}
      </div>

      <ProviderBottomNav tab={tab} setTab={setTab} />

      {showNotifs && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifs(false)} />}
    </div>
  );
}

function ProviderBottomNav({ tab, setTab }: { tab: ProviderTab; setTab: (t: ProviderTab) => void }) {
  const items: { key: ProviderTab; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Home" },
    { key: "bookings", icon: Calendar, label: "Bookings" },
    { key: "earnings", icon: Wallet, label: "Earnings" },
    { key: "chat", icon: MessageCircle, label: "Chat" },
    { key: "profile", icon: User, label: "Profile" },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-sm w-full bg-background/95 backdrop-blur-md border-t border-border z-30">
      <div className="flex items-center justify-around py-2">
        {items.map((it) => {
          const active = tab === it.key;
          const Icon = it.icon;
          return (
            <button key={it.key} onClick={() => setTab(it.key)} className="flex flex-col items-center gap-0.5 py-1 px-3 transition">
              <div className={`p-1.5 rounded-xl transition ${active ? "bg-primary-soft" : ""}`}>
                <Icon size={20} className={active ? "text-primary" : "text-muted-foreground"} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ----------- Provider Home / Stats ----------- */

function ProviderHome({ user, bookings, updateProvider }: { user: Provider; bookings: Booking[]; updateProvider: (id: string, p: Partial<Provider>) => void }) {
  const completed = bookings.filter((b) => b.status === "Completed");
  const earnings = completed.reduce((s, b) => s + b.price, 0);

  const weekData = useMemo(() => {
    return WEEK_DAYS.map((d, i) => ({
      day: d,
      bookings: ((user.id.charCodeAt(1) + i * 3) % 6) + 1,
    }));
  }, [user.id]);

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-extrabold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Hi, {user.name.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-muted-foreground">Here's how your business is doing.</p>
      </div>

      {/* Availability toggle */}
      <div className="bg-card rounded-2xl shadow-card p-4 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm">Available now</h4>
          <p className="text-xs text-muted-foreground">{user.available ? "You'll receive new requests" : "You're invisible to customers"}</p>
        </div>
        <button onClick={() => { updateProvider(user.id, { available: !user.available }); toast.success(`You are now ${!user.available ? "available" : "unavailable"}`); }}
          className={`relative w-12 h-7 rounded-full transition ${user.available ? "bg-success" : "bg-muted"}`}>
          <span className={`absolute top-0.5 w-6 h-6 bg-background rounded-full shadow-card transition ${user.available ? "left-[26px]" : "left-0.5"}`} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatBigCard label="Total Bookings" value={bookings.length} icon={Calendar} color="text-primary bg-primary-soft" />
        <StatBigCard label="Completed" value={completed.length} icon={CheckCircle2} color="text-success bg-success-soft" />
        <StatBigCard label="Earnings (mo)" value={`₹${earnings}`} icon={Wallet} color="text-accent bg-accent-soft" />
        <StatBigCard label="Rating" value={user.rating || "—"} icon={Star} color="text-warning bg-warning-soft" />
      </div>

      {/* Chart */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-1.5"><BarChart3 size={14} className="text-primary" />Weekly bookings</h3>
          <span className="text-xs text-success font-semibold flex items-center gap-1"><TrendingUp size={12} />+12%</span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <ReTooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-card)", fontSize: 12 }} />
              <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reviews snapshot */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Recent reviews</h3>
          <span className="text-xs font-semibold flex items-center gap-1"><Star size={12} className="fill-warning text-warning" />{user.rating}</span>
        </div>
        <div className="space-y-2">
          {user.reviews.slice(0, 2).map((r) => (
            <div key={r.id} className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">{r.reviewer}</span>
                <Stars value={r.stars} size={11} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>
            </div>
          ))}
          {user.reviews.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No reviews yet</p>}
        </div>
      </div>
    </div>
  );
}

const StatBigCard = ({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) => (
  <div className="bg-card rounded-2xl shadow-card p-3.5">
    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2`}>
      <Icon size={18} />
    </div>
    <div className="text-lg font-extrabold">{value}</div>
    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{label}</div>
  </div>
);

/* ----------- Provider Bookings ----------- */

function ProviderBookings({ bookings, customers, onUpdate }: {
  bookings: Booking[]; customers: Customer[];
  onUpdate: (id: string, s: BookingStatus) => void;
}) {
  const [tab, setTab] = useState<"new" | "confirmed" | "progress" | "completed">("new");
  const filtered = bookings.filter((b) => {
    if (tab === "new") return b.status === "Pending";
    if (tab === "confirmed") return b.status === "Confirmed";
    if (tab === "progress") return b.status === "In Progress";
    return b.status === "Completed";
  });

  return (
    <div className="px-4 pt-4 pb-2">
      <h2 className="text-xl font-extrabold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Manage Bookings</h2>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 mb-4">
        {([
          ["new", "New"], ["confirmed", "Confirmed"], ["progress", "In Progress"], ["completed", "Completed"],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${tab === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="Nothing here" subtitle="No bookings in this category." />
        ) : filtered.map((b) => {
          const c = customers.find((x) => x.id === b.customerId);
          if (!c) return null;
          return (
            <div key={b.id} className="bg-card rounded-2xl shadow-card p-3.5 animate-fade-in">
              <div className="flex items-start gap-3">
                <Avatar name={c.name} color={c.avatarColor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm">{c.name}</h4>
                      <p className="text-xs text-muted-foreground">{b.service}</p>
                    </div>
                    <Badge className={statusBadge(b.status)}>{b.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar size={11} />{b.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{b.slot}</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">₹{b.price}</span>
                    </div>
                    {b.address && <div className="flex items-start gap-1"><MapPin size={11} className="mt-0.5" /><span>{b.address}</span></div>}
                    <p className="italic text-muted-foreground">"{b.description}"</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {b.status === "Pending" && (
                  <>
                    <button onClick={() => onUpdate(b.id, "Cancelled")} className="flex-1 py-2 rounded-lg bg-destructive-soft text-destructive text-xs font-semibold">Decline</button>
                    <button onClick={() => onUpdate(b.id, "Confirmed")} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">Accept</button>
                  </>
                )}
                {b.status === "Confirmed" && (
                  <button onClick={() => onUpdate(b.id, "In Progress")} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">Mark In Progress</button>
                )}
                {b.status === "In Progress" && (
                  <button onClick={() => onUpdate(b.id, "Completed")} className="flex-1 py-2 rounded-lg bg-success text-success-foreground text-xs font-semibold">Mark Complete</button>
                )}
                {b.status === "Completed" && (
                  <span className="flex-1 py-2 rounded-lg bg-success-soft text-success text-xs font-semibold text-center">✓ Completed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------- Provider Earnings ----------- */

function ProviderEarnings({ bookings, customers }: { bookings: Booking[]; customers: Customer[] }) {
  const completed = bookings.filter((b) => b.status === "Completed");
  const total = completed.reduce((s, b) => s + b.price, 0);
  const pending = bookings.filter((b) => b.status === "In Progress").reduce((s, b) => s + b.price, 0);

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Earnings</h2>

      <div className="rounded-3xl gradient-primary p-5 text-primary-foreground shadow-elegant">
        <p className="text-xs uppercase tracking-wider opacity-80 font-semibold">Total earned</p>
        <h3 className="text-3xl font-extrabold mt-1">₹{total}</h3>
        <div className="flex items-center justify-between mt-4 text-xs">
          <div>
            <p className="opacity-80">This month</p>
            <p className="font-bold text-base">₹{total}</p>
          </div>
          <div>
            <p className="opacity-80">Pending payout</p>
            <p className="font-bold text-base">₹{pending}</p>
          </div>
          <button onClick={() => toast.success("Withdrawal requested!")} className="bg-background text-primary font-semibold rounded-full px-4 py-2 text-xs shadow-card">
            Withdraw
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm mb-3">Transaction history</h3>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {[...completed, ...bookings.filter((b) => b.status === "In Progress")].length === 0 ? (
            <EmptyState icon={Wallet} title="No transactions yet" subtitle="Your earnings will appear here." />
          ) : (
            <div className="divide-y divide-border">
              {[...completed, ...bookings.filter((b) => b.status === "In Progress")].map((b) => {
                const c = customers.find((x) => x.id === b.customerId);
                return (
                  <div key={b.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${b.status === "Completed" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
                      {b.status === "Completed" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c?.name}</p>
                      <p className="text-[11px] text-muted-foreground">{b.service} • {b.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">₹{b.price}</p>
                      <p className="text-[10px] text-muted-foreground">{b.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm mb-3">Reviews received</h3>
        <ProviderReviewsInline />
      </div>
    </div>
  );
}

const ProviderReviewsInline = () => null; // (handled inside profile + home)

/* ----------- Provider Profile (editable) ----------- */

function ProviderProfileEdit({ user, updateProvider, onLogout }: {
  user: Provider; updateProvider: (id: string, p: Partial<Provider>) => void; onLogout: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user.bio);
  const [exp, setExp] = useState(user.experience);
  const [skills, setSkills] = useState(user.skills.join(", "));
  const [area, setArea] = useState(user.serviceArea);
  const [pmin, setPmin] = useState(user.priceMin);
  const [pmax, setPmax] = useState(user.priceMax);
  const [showPreview, setShowPreview] = useState(false);

  const save = () => {
    updateProvider(user.id, {
      bio, experience: Number(exp), skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      serviceArea: area, priceMin: Number(pmin), priceMax: Number(pmax),
    });
    setEditing(false);
    toast.success("Profile updated");
  };

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      <div className="bg-card rounded-2xl shadow-card p-5 text-center relative">
        <button onClick={() => toast("Photo upload (mock)")} className="absolute top-3 right-3 p-2 rounded-full bg-muted hover:bg-secondary transition" aria-label="Upload">
          <Camera size={14} />
        </button>
        <Avatar name={user.name} color={user.avatarColor} size="xl" />
        <h2 className="font-extrabold text-xl mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.category}</p>
        {user.verified ? (
          <Badge className="bg-info-soft text-info mt-2"><ShieldCheck size={12} /> Verified</Badge>
        ) : (
          <Badge className="bg-warning-soft text-warning mt-2"><Clock size={12} /> Verification pending</Badge>
        )}
        <div className="flex items-center justify-center gap-3 mt-3 text-xs">
          <span className="flex items-center gap-1"><Star size={12} className="fill-warning text-warning" /><span className="font-bold">{user.rating || "—"}</span></span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{user.reviews.length} reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setEditing(!editing)} className="bg-primary-soft text-primary font-semibold rounded-2xl py-3 text-sm flex items-center justify-center gap-2">
          <Edit3 size={14} /> {editing ? "Cancel" : "Edit profile"}
        </button>
        <button onClick={() => setShowPreview(true)} className="bg-muted text-foreground font-semibold rounded-2xl py-3 text-sm flex items-center justify-center gap-2">
          <Eye size={14} /> Public preview
        </button>
      </div>

      {/* Editable card */}
      <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
        <Field label="Bio">
          {editing ? <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-xl bg-muted text-sm resize-none outline-none focus:ring-2 focus:ring-primary" />
            : <p className="text-sm text-muted-foreground">{user.bio}</p>}
        </Field>
        <Field label="Experience (years)">
          {editing ? <input type="number" value={exp} onChange={(e) => setExp(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-primary" />
            : <p className="text-sm text-muted-foreground">{user.experience} years</p>}
        </Field>
        <Field label="Skills (comma separated)">
          {editing ? <input value={skills} onChange={(e) => setSkills(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-primary" />
            : <div className="flex flex-wrap gap-1.5">{user.skills.map((s) => <span key={s} className="px-2.5 py-1 bg-muted rounded-full text-[11px] font-medium">{s}</span>)}</div>}
        </Field>
        <Field label="Service area">
          {editing ? <input value={area} onChange={(e) => setArea(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-primary" />
            : <p className="text-sm text-muted-foreground">{user.serviceArea}</p>}
        </Field>
        <Field label="Price range (₹)">
          {editing ? (
            <div className="flex items-center gap-2">
              <input type="number" value={pmin} onChange={(e) => setPmin(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-primary" />
              <span className="text-muted-foreground">to</span>
              <input type="number" value={pmax} onChange={(e) => setPmax(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          ) : <p className="text-sm text-muted-foreground">₹{user.priceMin} – ₹{user.priceMax} per {user.priceUnit}</p>}
        </Field>
        {editing && (
          <button onClick={save} className="w-full gradient-primary text-primary-foreground font-semibold rounded-full py-2.5 text-sm shadow-elegant">
            Save changes
          </button>
        )}
      </div>

      {/* Reviews list */}
      <div>
        <h3 className="font-bold text-sm mb-3">Reviews received ({user.reviews.length})</h3>
        <div className="space-y-2">
          {user.reviews.length === 0 ? (
            <EmptyState icon={Star} title="No reviews yet" subtitle="Complete bookings to receive reviews." />
          ) : user.reviews.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl shadow-card p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{r.reviewer}</span>
                <Stars value={r.stars} size={12} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{r.comment}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5">{r.date}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onLogout} className="w-full bg-destructive-soft text-destructive font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2">
        <LogOut size={16} /> Log out
      </button>

      {showPreview && (
        <ProviderProfileModal provider={user} onClose={() => setShowPreview(false)} onBook={() => setShowPreview(false)} onChat={() => setShowPreview(false)} />
      )}
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
    <div className="mt-1.5">{children}</div>
  </div>
);
