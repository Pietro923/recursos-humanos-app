"use client"
import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Briefcase, Archive, Trash2, Link, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { useTranslation } from "react-i18next"

interface JobPosting {
  id: number
  title: string
  company?: string
  description: string
  status: 'active' | 'archived'
  url: string
  createdAt: Date
}

export default function JobPostingsPage() {
  const [postings, setPostings] = useState<JobPosting[]>([])
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedPosting, setSelectedPosting] = useState<JobPosting | null>(null)
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showConfirmArchive, setShowConfirmArchive] = useState(false)
  const { t } = useTranslation(); // Hook de traducción
  
  // Form states
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    lastName: "",
    department: "",
    position: "",
    startDate: "",
    salary: ""
  })

  const isValidLinkedInUrl = (url: string) => {
    return url.includes('linkedin.com/jobs/') || url.includes('linkedin.com/job/')
  }

  const handleAddJob = async () => {
    if (!isValidLinkedInUrl(url)) {
      toast({
        title: t("postulaciones.toast.title1"),
        description: t("postulaciones.toast.description1"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.get("/api/extract-job-title", {
        params: { url },
      });
      const { title, description, company } = response.data;

      const newPosting: JobPosting = {
        id: Date.now(),
        title,
        company,
        description,
        status: "active",
        url,
        createdAt: new Date(),
      };

      setPostings((prev) => [newPosting, ...prev]);
      setUrl("");
      toast({
        title: t("postulaciones.toast.title2"),
        description: t("postulaciones.toast.description2"),
      });
    } catch (error) {
      toast({
        title: t("postulaciones.toast.title3"),
        description: t("postulaciones.toast.description3"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchivePosting = async (posting: JobPosting) => {
    try {
      const updatedPostings = postings.map((p) =>
        p.id === posting.id ? { ...p, status: "archived" as const } : p
      );
      setPostings(updatedPostings);
      setSelectedPosting(null);
      setShowConfirmArchive(false);
      toast({
        title: t("postulaciones.toast.title4"),
        description: t("postulaciones.toast.description4"),
      });
    } catch (error) {
      toast({
        title: t("postulaciones.toast.title5"),
        description: t("postulaciones.toast.description5"),
        variant: "destructive",
      });
    }
  };

  const handleDeletePosting = async (postingId: number) => {
    try {
      setPostings((prev) => prev.filter((p) => p.id !== postingId));
      setSelectedPosting(null);
      toast({
        title: t("postulaciones.toast.title6"),
        description: t("postulaciones.toast.description6"),
      });
    } catch (error) {
      toast({
        title: t("postulaciones.toast.title7"),
        description: t("postulaciones.toast.description7"),
        variant: "destructive",
      });
    }
  };

  const handleRegisterEmployee = async () => {
    try {
      await axios.post("/api/register-employee", employeeForm);
      if (selectedPosting) {
        handleArchivePosting(selectedPosting);
      }
      setEmployeeForm({
        name: "",
        lastName: "",
        department: "",
        position: "",
        startDate: "",
        salary: "",
      });
      setShowEmployeeForm(false);
      toast({
        title: t("postulaciones.toast.title8"),
        description: t("postulaciones.toast.description8"),
      });
    } catch (error) {
      toast({
        title: t("postulaciones.toast.title9"),
        description: t("postulaciones.toast.description9"),
        variant: "destructive",
      });
    }
  };

  const filteredPostings = postings.filter(posting =>
    posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    posting.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 space-y-6  dark:text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('postulaciones.jobApplications.header.title')}</h1>
        </div>
        <Button
        className="dark:bg-gray-700 dark:hover:bg-gray-600"
          variant="outline"
          onClick={() => setSearchVisible(!searchVisible)}
        >
          <Search className="h-5 w-5 mr-2 dark:text-white" />
          {t('postulaciones.jobApplications.header.searchButton')}
        </Button>
      </div>

      {searchVisible && (
        <div className="mb-6">
          <Input
            type="text"
            placeholder= {t('postulaciones.jobApplications.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      <div className="flex space-x-4 items-center mb-8">
        <div className="flex-1">
          <Input
            type="url"
            placeholder={t('postulaciones.jobApplications.addJob.urlPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
          />
        </div>
        <Button 
        className="dark:bg-gray-700 hover:bg-gray-600 dark:text-white"
          onClick={handleAddJob} 
          disabled={loading || !url}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin dark:bg-gray-700" />
              {t('postulaciones.jobApplications.addJob.loading')}
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4 dark:text-white " />
              {t('postulaciones.jobApplications.addJob.addButton')}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPostings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-gray-500">
            {t('postulaciones.jobApplications.noResults')}
            </p>
          </div>
        ) : (
          filteredPostings.map((posting) => (
            <Card key={posting.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="line-clamp-2">{posting.title}</CardTitle>
                    {posting.company && (
                      <CardDescription className="mt-1">
                        {posting.company}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={posting.status === 'active' ? 'default' : 'secondary'}>
                    {posting.status === 'active' ? 'Activa' : 'Archivada'}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="mt-auto pt-6">
                <Button 
                  className="w-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  onClick={() => setSelectedPosting(posting)}
                >
                  {t('postulaciones.jobApplications.details.viewDetailsButton')}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalles */}
      {selectedPosting && (
        <Dialog open={!!selectedPosting} onOpenChange={() => setSelectedPosting(null)}>
          <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 dark:text-white">
            <DialogHeader>
              <DialogTitle>{selectedPosting.title}</DialogTitle>
              {selectedPosting.company && (
                <p className="text-sm text-muted-foreground">{selectedPosting.company}</p>
              )}
            </DialogHeader>
            
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <div className="prose prose-sm">
                {selectedPosting.description.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            <DialogFooter className="sm:justify-start gap-2">
              {selectedPosting.status === 'active' && (
                <Button
                  onClick={() => setShowConfirmArchive(true)}
                  className="gap-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                >
                  <Archive className="h-4 w-4" />
                  {t('postulaciones.jobApplications.details.dialog.archiveButton')}
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDeletePosting(selectedPosting.id)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('postulaciones.jobApplications.details.dialog.deleteButton')}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(selectedPosting.url, '_blank')}
                className="gap-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                <Link className="h-4 w-4" />
                {t('postulaciones.jobApplications.details.dialog.viewOnLinkedIn')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de confirmación de archivo */}
      <Dialog open={showConfirmArchive} onOpenChange={setShowConfirmArchive}>
        <DialogContent className="bg-white dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>{t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
          {t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.description')}
          </p>
          <DialogFooter>
            <Button
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              variant="outline"
              onClick={() => {
                setShowConfirmArchive(false)
                if (selectedPosting) handleArchivePosting(selectedPosting)
              }}
            >
              {t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.archiveOnly')}
            </Button>
            <Button
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              onClick={() => {
                setShowConfirmArchive(false)
                setShowEmployeeForm(true)
              }}
            >
              {t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployee')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de registro de empleado */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-md bg-white  dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle> {t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.title')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Input
            className="dark:border-gray-500"
              placeholder={t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.fields.name')}
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm(prev => ({...prev, name: e.target.value}))}
            />
            <Input
             className="dark:border-gray-500"
              placeholder={t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.fields.lastName')}
              value={employeeForm.lastName}
              onChange={(e) => setEmployeeForm(prev => ({...prev, lastName: e.target.value}))}
            />
            <Input
             className="dark:border-gray-500"
              placeholder={t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.fields.department')}
              value={employeeForm.department}
              onChange={(e) => setEmployeeForm(prev => ({...prev, department: e.target.value}))}
            />
            <Input
             className="dark:border-gray-500"
              placeholder={t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.fields.position')}
              value={employeeForm.position}
              onChange={(e) => setEmployeeForm(prev => ({...prev, position: e.target.value}))}
            />
            <Input
             className="dark:border-gray-500"
              type="date"
              placeholder={t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.fields.startDate')}
              value={employeeForm.startDate}
              onChange={(e) => setEmployeeForm(prev => ({...prev, startDate: e.target.value}))}
            />
            <Input
             className="dark:border-gray-500"
              type="number"
              placeholder={t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.fields.salary')}
              value={employeeForm.salary}
              onChange={(e) => setEmployeeForm(prev => ({...prev, salary: e.target.value}))}
            />
          </div>

          <DialogFooter>
            <Button className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white" variant="outline" onClick={() => setShowEmployeeForm(false)}>
             {t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.cancel')}
            </Button>
            <Button className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white" onClick={handleRegisterEmployee}>
            {t('postulaciones.jobApplications.details.dialog.registerEmployeeDialog.registerEmployeeForm.register')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}