
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image, Upload, Download, Trash2, Eye, Search, Filter, Calendar, FileText } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface ImageFile {
  id: string
  nome_arquivo: string
  tipo_arquivo: string
  categoria: string
  tamanho_bytes: number | null
  data_upload: string
  url_storage: string
  descricao?: string | null
}

interface ImagesSectionProps {
  pacienteId?: string;
}

export function ImagesSection({ pacienteId }: ImagesSectionProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const fetchImages = async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anexos_medicos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_upload', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erro ao buscar anexos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pacienteId) {
      fetchImages();
    }
  }, [pacienteId]);

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Exames': return 'bg-blue-100 text-blue-800'
      case 'Documentos': return 'bg-green-100 text-green-800'
      case 'Fotos': return 'bg-purple-100 text-purple-800'
      case 'Outros': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    const lowerTipo = tipo.toLowerCase();
    if (lowerTipo.includes('image') || lowerTipo.includes('jpg') || lowerTipo.includes('png')) {
      return 'bg-purple-100 text-purple-800'
    }
    if (lowerTipo.includes('pdf')) {
      return 'bg-red-100 text-red-800'
    }
    if (lowerTipo.includes('doc')) {
      return 'bg-blue-100 text-blue-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const filteredImages = images.filter(image => {
    const matchesSearch = image.nome_arquivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesCategory = selectedCategory === 'all' || image.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleRemoveImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anexos_medicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Imagens e Anexos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="galeria" className="space-y-4">
            <TabsList>
              <TabsTrigger value="galeria">Galeria</TabsTrigger>
              {pacienteId && <TabsTrigger value="upload">Upload</TabsTrigger>}
              <TabsTrigger value="organizacao">Organização</TabsTrigger>
            </TabsList>

            <TabsContent value="galeria" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar imagens e documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  className="px-3 py-2 border rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Todas as categorias</option>
                  <option value="Exames">Exames</option>
                  <option value="Documentos">Documentos</option>
                  <option value="Fotos">Fotos</option>
                  <option value="Outros">Outros</option>
                </select>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {image.tipo_arquivo.toLowerCase().includes('image') ? (
                        <Image className="h-16 w-16 text-gray-400" />
                      ) : (
                        <FileText className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm truncate">{image.nome_arquivo}</h4>
                          <div className="flex gap-1">
                            <Badge className={getTipoColor(image.tipo_arquivo)} variant="secondary">
                              {image.tipo_arquivo.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={getCategoryColor(image.categoria)} variant="outline">
                          {image.categoria}
                        </Badge>
                        {image.descricao && (
                          <p className="text-xs text-gray-600 line-clamp-2">{image.descricao}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(image.data_upload).toLocaleDateString('pt-BR')}
                          </div>
                          <span>{formatFileSize(image.tamanho_bytes)}</span>
                        </div>
                        <div className="flex gap-1 pt-2">
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleRemoveImage(image.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredImages.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma imagem ou documento encontrado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {pacienteId && (
              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload de Arquivos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Arraste arquivos aqui ou clique para selecionar
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Suporte para imagens (JPG, PNG, DICOM) e documentos (PDF, DOC)
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline">Selecionar Arquivos</Button>
                        <Button variant="outline">Câmera</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Categoria</label>
                        <select className="w-full px-3 py-2 border rounded-md">
                          <option value="Exames">Exames</option>
                          <option value="Documentos">Documentos</option>
                          <option value="Fotos">Fotos</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Subcategoria</label>
                        <Input placeholder="Ex: Raio-X, Ultrassom..." />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Descrição (opcional)</label>
                      <Input placeholder="Descrição do arquivo..." />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="organizacao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organização de Arquivos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Exames', 'Documentos', 'Fotos', 'Outros'].map((categoria) => (
                      <Card key={categoria} className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {images.filter(img => img.categoria === categoria).length}
                          </div>
                          <div className="text-sm text-gray-600">{categoria}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Ações em Lote</h4>
                    <div className="flex gap-2">
                      <Button variant="outline">Mover Selecionados</Button>
                      <Button variant="outline">Baixar Selecionados</Button>
                      <Button variant="outline">Excluir Selecionados</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
