import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { TrendingUp, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, pricing: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('admin_token');
      try {
        const [contactsRes, pricingRes, projectsRes] = await Promise.all([
          fetch('http://localhost:3001/api/contacts', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:3001/api/pricing'),
          fetch('http://localhost:3001/api/projects'),
        ]);

        const contacts = await contactsRes.json();
        const pricing = await pricingRes.json();
        const projects = await projectsRes.json();

        setStats({
          contacts: contacts.length || 125, // Demo value
          pricing: pricing.length || 4,     // Demo value
          projects: projects.length || 12,  // Demo value
        });

      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Data untuk grafik penjualan (7 hari terakhir)
  const salesData = [
    { name: '5 Des', value: 10200000 },
    { name: '6 Des', value: 15000000 },
    { name: '7 Des', value: 12500000 },
    { name: '8 Des', value: 18000000 },
    { name: '9 Des', value: 16000000 },
    { name: '10 Des', value: 20000000 },
    { name: '11 Des', value: 17500000 },
  ];

  // Data untuk Laba/Rugi
  const profitLossData = [
    { name: 'Penjualan', value: 445000000, percentage: 88, color: '#10b981' }, // Green for success
    { name: 'Pengeluaran', value: 50000000, percentage: 10, color: '#f59e0b' }, // Yellow for warning
    { name: 'Pengadaan', value: 10000000, percentage: 2, color: '#ef4444' }, // Red for expense
  ];

  // Data untuk Beban Perusahaan
  const expenseData = [
    { name: 'Beban Barang', value: 50, color: '#5e6ad2' }, // Primary color
    { name: 'Beban Lainnya', value: 50, color: '#8b5cf6' }, // Purple
  ];

  // Aktivitas Terbaru
  const recentActivities = [
    { date: '05', month: 'Des', description: 'Buat Kategori Barang harga disesuaikan' },
    { date: '06', month: 'Okt', description: 'Buat Kategori Penjualan Id:2022.12.00003' },
    { date: '06', month: 'Okt', description: 'Buat Kategori Penjualan Id:2022.12.00002' },
    { date: '06', month: 'Okt', description: 'Buat Kategori Penjualan Id:2022.12.00001' },
  ];

  // Kegiatan Mendatang
  const upcomingActivities = [
    { date: '06', month: 'Okt', description: 'Buka transaksi penjualan, Buka Cihsuka' },
    { date: '12', month: 'Okt', description: 'Jatuh tempo pinjaman, Buku Maknyus' },
    { date: '12', month: 'Okt', description: 'Jatuh tempo pinjaman, Buku Maknyus' },
  ];

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pricing Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pricing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom Kiri - Aktivitas */}
        <div className="space-y-6">
          {/* Aktivitas Terbaru */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Aktivitas Terbaru</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Tentang Semuanya terakhir</p>
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-primary/10">
                      <span className="text-xs font-semibold">{activity.date}</span>
                      <span className="text-[10px] text-muted-foreground">{activity.month}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kegiatan Mendatang */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Kegiatan Mendatang</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingActivities.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-primary/10">
                      <span className="text-xs font-semibold">{activity.date}</span>
                      <span className="text-[10px] text-muted-foreground">{activity.month}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Produk Terlaris - New Section to fill empty space */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Produk Terlaris</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Website Company Profile', sales: 45, revenue: 'Rp 135.000.000' },
                { name: 'Aplikasi Kasir (POS)', sales: 32, revenue: 'Rp 96.000.000' },
                { name: 'Sistem Manajemen Gudang', sales: 28, revenue: 'Rp 140.000.000' },
                { name: 'Landing Page Custom', sales: 20, revenue: 'Rp 30.000.000' },
                { name: 'Jasa SEO Bulanan', sales: 15, revenue: 'Rp 22.500.000' },
                { name: 'Maintenance Website', sales: 12, revenue: 'Rp 18.000.000' },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} Terjual</p>
                  </div>
                  <div className="font-medium text-sm">{product.revenue}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Tengah - Grafik & Aset */}
        <div className="space-y-6">
          {/* Aset Saat Ini */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Aset saat ini</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Per Hari ini</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">Rp 194.258.000</div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Dibanding Bulan lalu</span>
                  <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <TrendingUp className="h-3 w-3" />
                    6,20%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grafik Penjualan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Grafik Penjualan</CardTitle>
              <div className="flex items-center gap-2">
                <select className="rounded-md border border-border bg-background px-2 py-1 text-xs">
                  <option>5 Des</option>
                </select>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-muted-foreground">Tentang Semuanya terakhir</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: 'var(--radius)',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#5e6ad2" 
                      strokeWidth={2}
                      dot={{ fill: '#5e6ad2', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#f59e0b]"></div>
                  <span>Kas Masuk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#5e6ad2]"></div>
                  <span>Kas Keluar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#10b981]"></div>
                  <span>Kas Bersih</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Laba/Rugi Tahun Ini */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Laba/Rugi Tahun Ini</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-muted-foreground">Dibanding Tahun / Hari 2022.12.2023</p>
              <div className="flex items-center gap-4">
                <div className="h-[160px] w-[160px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={profitLossData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {profitLossData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  {profitLossData.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 truncate">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                          <span className="truncate">{item.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">{formatCurrency(item.value)}</span>
                        <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan - Total & Beban */}
        <div className="space-y-6">
          {/* Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Total</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Dibanding Bulan lalu</span>
                  <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <TrendingUp className="h-3 w-3" />
                    6,20%
                  </Badge>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm">No 193.196.313</span>
                  <span className="text-sm font-semibold">Rp 194.222.00</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Dibanding Tahun lalu</span>
                  <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <TrendingUp className="h-3 w-3" />
                    6,20%
                  </Badge>
                </div>
                <div className="mt-2 text-2xl font-bold text-green-500">Rp 5.550.069</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah Transaksi</span>
                    <span className="font-semibold">50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jenis Barang</span>
                    <span className="font-semibold">50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah Barang</span>
                    <span className="font-semibold">50</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="text-sm font-semibold">Beban Perusahaan</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#10b981]"></div>
                      <span className="text-muted-foreground">Penjualan</span>
                    </div>
                    <span className="font-semibold">Rp 445.000.000</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#f59e0b]"></div>
                      <span className="text-muted-foreground">Piutang</span>
                    </div>
                    <span className="font-semibold">Rp 50.000.000</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#ef4444]"></div>
                      <span className="text-muted-foreground">Beban Lainnya</span>
                    </div>
                    <span className="font-semibold">Rp 50.000.000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Beban Perusahaan Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Beban Perusahaan</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-muted-foreground">Dibanding Tahun / Hari 2022.12.2023</p>
              <div className="flex items-center gap-6">
                <div className="h-[150px] w-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {expenseData.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performa Server - Moved here */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Performa Server</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>CPU Usage</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Memory Usage</span>
                  <span className="font-medium">62%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-[#f59e0b]" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Storage</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-[#10b981]" style={{ width: '28%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
