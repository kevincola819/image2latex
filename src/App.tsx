import { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Copy, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [latex, setLatex] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件 (Please upload an image file)')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    processImage(file)
  }, [])

  const processImage = async (file: File) => {
    setIsProcessing(true)
    setLatex('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://127.0.0.1:8001/api/recognize', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      if (data.status === 'success') {
        setLatex(data.latex)
        toast.success('识别成功 (Recognition successful)')
      } else {
        throw new Error(data.message || 'Recognition failed')
      }
    } catch (error) {
      console.error(error)
      toast.error('识别失败，请检查后端服务是否正常运行 (Recognition failed, please check backend service)')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          handleFile(file)
          e.preventDefault()
          break
        }
      }
    }
  }, [handleFile])

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  const copyToClipboard = async () => {
    if (!latex) return
    try {
      await navigator.clipboard.writeText(latex)
      setIsCopied(true)
      toast.success('已复制到剪贴板 (Copied to clipboard)')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast.error('复制失败 (Failed to copy)')
    }
  }

  const resetState = () => {
    setImage(null)
    setPreview(null)
    setLatex('')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-indigo-500/30">
      <Toaster theme="dark" position="top-center" />
      
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white font-serif tracking-tighter">∑</span>
            </div>
            <h1 className="font-semibold text-lg tracking-wide text-zinc-100">Img2LaTeX</h1>
          </div>
          <div className="text-xs font-medium text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            Cmd/Ctrl + V to paste
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Input */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium text-zinc-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              输入区域 (Input)
            </h2>
            
            <div 
              className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden bg-white/[0.02] min-h-[400px] flex flex-col items-center justify-center ${preview ? 'border-indigo-500/30' : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.04]'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />

              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full flex flex-col relative"
                  >
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); resetState() }}
                        className="p-2 bg-black/50 backdrop-blur-md hover:bg-red-500/80 text-white rounded-xl transition-colors shadow-xl"
                        title="清除 (Clear)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-center min-h-[400px]">
                      <img src={preview} alt="Formula Preview" className="max-w-full max-h-full object-contain rounded-lg drop-shadow-2xl" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center p-8 cursor-pointer"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-500 ease-out">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-medium text-zinc-200 mb-2">点击上传或拖拽图片</h3>
                    <p className="text-sm text-zinc-500 max-w-[250px] mx-auto leading-relaxed">
                      支持 PNG, JPG 等格式。您也可以直接在此页面按下 <kbd className="px-2 py-1 bg-white/10 rounded-md text-zinc-300 font-mono text-xs mx-1">Ctrl+V</kbd> 粘贴剪贴板中的截图。
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium text-zinc-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              识别结果 (Output)
            </h2>

            {/* LaTeX Code Editor */}
            <div className="relative rounded-3xl border border-white/10 bg-[#0f0f0f] overflow-hidden flex flex-col shadow-2xl">
              <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
                <span className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  LaTeX Code
                </span>
                <button
                  onClick={copyToClipboard}
                  disabled={!latex || isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                >
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? '已复制' : '复制'}
                </button>
              </div>
              <div className="relative min-h-[160px]">
                {isProcessing ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f]/80 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                        <span className="font-serif text-indigo-400 font-bold text-sm">∑</span>
                      </div>
                      <span className="text-sm font-medium text-indigo-400 animate-pulse tracking-widest">AI 识别中...</span>
                    </div>
                  </div>
                ) : null}
                <textarea
                  value={latex}
                  onChange={(e) => setLatex(e.target.value)}
                  placeholder={isProcessing ? '' : "等待识别结果..."}
                  className="w-full h-full min-h-[160px] bg-transparent text-zinc-300 font-mono text-sm p-5 focus:outline-none resize-none placeholder:text-zinc-700 leading-relaxed"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Rendered Formula Preview */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 min-h-[200px] flex flex-col shadow-inner">
              <span className="text-xs font-mono text-zinc-500 mb-4 block">Preview Render</span>
              <div className="flex-1 flex items-center justify-center overflow-x-auto overflow-y-hidden custom-scrollbar">
                {latex ? (
                  <div className="text-xl md:text-2xl text-zinc-100 py-4 px-2 min-w-full text-center">
                    <BlockMath math={latex} errorColor={'#ef4444'} />
                  </div>
                ) : (
                  <span className="text-sm text-zinc-700 font-medium">预览将在此显示</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Custom CSS for scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  )
}

export default App
