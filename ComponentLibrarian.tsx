Sample mvp import React, { useState, useEffect } from 'react';
import { 
  Code, 
  FileJson, 
  CheckCircle, 
  ArrowRight, 
  Package, 
  Type, 
  FileText, 
  Layers, 
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
  Wand2
} from 'lucide-react';

// --- UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, variant = 'primary', children, icon: Icon, disabled = false }) => {
  const baseStyles = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    outline: "border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  );
};

const Label = ({ children }) => (
  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
    {children}
  </label>
);

const Input = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800"
  />
);

const Select = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800 appearance-none cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <ChevronRight size={16} className="rotate-90" />
    </div>
  </div>
);

const TextArea = ({ value, onChange, placeholder, rows = 4, className = "" }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800 font-mono text-sm ${className}`}
  />
);

// --- HELPER LOGIC ---

const parseCodeSnippet = (code) => {
  // 1. Extract Component Name
  // Looks for 'export default function Name' or 'const Name ='
  const exportDefaultMatch = code.match(/export\s+default\s+function\s+(\w+)/);
  const constMatch = code.match(/const\s+(\w+)\s*=\s*(\(|props|{)/);
  const name = exportDefaultMatch ? exportDefaultMatch[1] : (constMatch ? constMatch[1] : '');

  // 2. Extract Dependencies (Imports)
  // Looks for lines starting with import, excluding relative paths (./ or ../) and 'react'
  const importLines = code.match(/import\s+.*?\s+from\s+['"](.*?)['"]/g) || [];
  const dependencies = importLines
    .map(line => {
      const match = line.match(/from\s+['"](.*?)['"]/);
      return match ? match[1] : null;
    })
    .filter(dep => dep && !dep.startsWith('.') && dep !== 'react')
    .map(dep => dep.split('/')[0]) // Get root package name
    .filter((value, index, self) => self.indexOf(value) === index); // Unique

  // 3. extract JSDoc or comments before the component
  const commentsMatch = code.match(/\/\*\*([\s\S]*?)\*\//);
  let description = "";
  if (commentsMatch) {
    description = commentsMatch[1]
      .replace(/\*/g, '')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('@')) // Filter out tags like @param
      .join(' ');
  }

  // 4. Guess Type based on name
  let type = "Atom";
  if (name) {
    const n = name.toLowerCase();
    if (n.includes('card') || n.includes('modal') || n.includes('nav')) type = "Molecule";
    if (n.includes('page') || n.includes('layout') || n.includes('dashboard')) type = "Organism";
    if (n.includes('provider') || n.includes('context')) type = "Logic";
  }

  return {
    name: name || "UntitledComponent",
    type,
    dependencies: dependencies.join(', '),
    description: description || "No description extracted."
  };
};

// --- MAIN APP ---

export default function ComponentLibrarian() {
  const [step, setStep] = useState(1);
  const [rawCode, setRawCode] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Atom',
    dependencies: '',
    description: ''
  });
  const [copied, setCopied] = useState(false);

  const handleParse = () => {
    if (!rawCode.trim()) return;
    
    setIsParsing(true);
    
    // Simulate a slight delay for "processing" feel
    setTimeout(() => {
      const parsed = parseCodeSnippet(rawCode);
      setFormData(parsed);
      setIsParsing(false);
      setStep(2);
    }, 600);
  };

  const handleCreate = () => {
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setRawCode('');
    setFormData({ name: '', type: 'Atom', dependencies: '', description: '' });
  };

  const copyToClipboard = () => {
    const jsonOutput = JSON.stringify({ ...formData, codeSnippet: rawCode }, null, 2);
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Stages
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Paste Component Code</h2>
        <p className="text-slate-500">We'll analyze your code to auto-generate the documentation record.</p>
      </div>

      <div className="relative">
        <TextArea
          value={rawCode}
          onChange={(e) => setRawCode(e.target.value)}
          placeholder="// Paste your React component here...&#10;import React from 'react';&#10;export default function Button() { ... }"
          rows={12}
          className="font-mono text-xs md:text-sm bg-slate-900 text-slate-50 border-slate-800 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleParse} 
          disabled={!rawCode.trim() || isParsing}
          icon={isParsing ? Wand2 : ArrowRight}
        >
          {isParsing ? 'Analyzing...' : 'Analyze & Parse'}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Review & Edit</h2>
        <p className="text-slate-500">We extracted this information. Verify matches before creating the record.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Component Name</Label>
            <div className="relative">
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Type size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <Label>Component Type</Label>
            <Select 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              options={["Atom", "Molecule", "Organism", "Template", "Logic", "Utility"]} 
            />
          </div>

          <div>
            <Label>Dependencies</Label>
            <div className="relative">
              <Input 
                value={formData.dependencies} 
                onChange={(e) => setFormData({...formData, dependencies: e.target.value})}
                placeholder="e.g. framer-motion, clsx"
              />
              <Package size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Comma separated npm packages</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <TextArea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={8}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={handleCreate} icon={CheckCircle}>Create Record</Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Record Created Successfully!</h2>
        <p className="text-slate-500">Your component has been documented and is ready for the library.</p>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 flex items-center">
            <FileJson size={18} className="mr-2 text-indigo-600" />
            Record Payload
          </h3>
          <button 
            onClick={copyToClipboard}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            {copied ? <span className="text-green-600 flex items-center"><Check size={14} className="mr-1"/> Copied</span> : <span className="flex items-center"><Copy size={14} className="mr-1"/> Copy JSON</span>}
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-64 bg-slate-900">
          <pre className="text-xs font-mono text-green-400">
            {JSON.stringify({
              ...formData,
              codeSnippet: rawCode.substring(0, 100) + '... (full code stored)'
            }, null, 2)}
          </pre>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Name</span>
            <p className="font-medium text-slate-800">{formData.name}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Type</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
              {formData.type}
            </span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 col-span-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Dependencies</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.dependencies.split(',').filter(d => d.trim()).length > 0 ? (
                formData.dependencies.split(',').map((dep, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <Package size={12} className="mr-1" /> {dep.trim()}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic">None detected</span>
              )}
            </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button variant="secondary" onClick={handleReset} icon={RotateCcw}>Process Another Component</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800 pb-12">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Layers className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">AutoLib <span className="text-slate-400 font-normal">Builder</span></h1>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            v1.0.0 MVP
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 -z-10 rounded-full`} 
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            
            {[
              { id: 1, label: "Code Input", icon: Code },
              { id: 2, label: "Parse & Edit", icon: FileText },
              { id: 3, label: "Finalize", icon: CheckCircle }
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.id;
              const isCurrent = step === s.id;
              
              return (
                <div key={s.id} className="flex flex-col items-center bg-slate-50 px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`mt-2 text-xs font-bold transition-colors ${
                    isCurrent ? 'text-indigo-700' : isActive ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <Card className="p-6 md:p-8 min-h-[500px] relative">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </Card>

      </main>
    </div>
  );
}

