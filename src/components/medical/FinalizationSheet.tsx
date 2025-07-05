
import React from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface FinalizationSheetProps {
  finalizationOpen: boolean
  setFinalizationOpen: (open: boolean) => void
  signatureType: 'none' | 'installed' | 'cloud'
  setSignatureType: (type: 'none' | 'installed' | 'cloud') => void
  confirmFinish: () => void
}

export function FinalizationSheet({ 
  finalizationOpen, 
  setFinalizationOpen, 
  signatureType, 
  setSignatureType, 
  confirmFinish 
}: FinalizationSheetProps) {
  return (
    <Sheet open={finalizationOpen} onOpenChange={setFinalizationOpen}>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>Finalizar atendimento</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Atenção!</p>
                <p className="text-yellow-700 mt-1">
                  Ao finalizar um atendimento, você não poderá alterá-lo novamente. Deseja prosseguir?
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Assinar com:</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="signature"
                  value="none"
                  checked={signatureType === 'none'}
                  onChange={(e) => setSignatureType(e.target.value as any)}
                />
                <span>Não assinar</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="signature"
                  value="installed"
                  checked={signatureType === 'installed'}
                  onChange={(e) => setSignatureType(e.target.value as any)}
                />
                <div>
                  <div>Certificado instalado</div>
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Certificado válido
                  </div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="signature"
                  value="cloud"
                  checked={signatureType === 'cloud'}
                  onChange={(e) => setSignatureType(e.target.value as any)}
                />
                <span>Certificado na nuvem</span>
              </label>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setFinalizationOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={confirmFinish}
            >
              Finalizar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
