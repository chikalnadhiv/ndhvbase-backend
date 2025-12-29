import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Trash2, Save, ExternalLink, LucideIcon, icons } from 'lucide-react';
import { toast } from 'sonner';

interface SocialLink {
  id: number;
  name: string;
  icon: string;
  url: string;
}

export default function SocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/social-links`);
      const data = await res.json();
      setLinks(data);
    } catch (error) {
      console.error('Failed to fetch social links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setLinks([...links, { id: -1, name: '', icon: 'Link', url: '' }]);
  };

  const handleUpdateLocal = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleSave = async (index: number) => {
    const link = links[index];
    const token = localStorage.getItem('admin_token');
    
    setSaving(true);
    try {
      const method = link.id === -1 ? 'POST' : 'PUT';
      const url = link.id === -1 ? `${API_URL}/api/social-links` : `${API_URL}/api/social-links/${link.id}`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(link),
      });

      if (res.ok) {
        const savedLink = await res.json();
        const newLinks = [...links];
        newLinks[index] = savedLink;
        setLinks(newLinks);
        toast.success(link.id === -1 ? 'Link created' : 'Link updated');
      } else {
        toast.error('Failed to save link');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    const link = links[index];
    if (link.id === -1) {
      setLinks(links.filter((_, i) => i !== index));
      return;
    }

    if (!confirm('Are you sure you want to delete this link?')) return;

    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_URL}/api/social-links/${link.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setLinks(links.filter((_, i) => i !== index));
        toast.success('Link deleted');
      } else {
        toast.error('Failed to delete link');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Links</h1>
          <p className="text-muted-foreground">Manage social media links shown in the footer.</p>
        </div>
        <Button onClick={handleAddLink} className="gap-2">
          <Plus size={16} />
          Add Link
        </Button>
      </div>

      <div className="grid gap-6">
        {links.map((link, index) => {
          const Icon = (icons as any)[link.icon] || icons.Link;
          
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-end">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Platform Name</label>
                        <Input 
                          placeholder="e.g. Instagram" 
                          value={link.name}
                          onChange={(e) => handleUpdateLocal(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Lucide Icon Name</label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="e.g. Instagram" 
                            value={link.icon}
                            onChange={(e) => handleUpdateLocal(index, 'icon', e.target.value)}
                          />
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                            <Icon size={20} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Link URL</label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="https://..." 
                            value={link.url}
                            onChange={(e) => handleUpdateLocal(index, 'url', e.target.value)}
                          />
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon">
                              <ExternalLink size={16} />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSave(index)} 
                      disabled={saving}
                      className="gap-2"
                    >
                      <Save size={16} />
                      Save
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {links.length === 0 && (
          <Card className="flex h-32 items-center justify-center text-muted-foreground border-dashed">
            No social links added yet.
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Icon Reference</CardTitle>
          <CardDescription>
            Use names from <a href="https://lucide.dev/icons" target="_blank" className="text-primary hover:underline">Lucide Icons</a>.
            Some common names: Instagram, Facebook, Github, Twitter, Linkedin, Youtube, Mail.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
