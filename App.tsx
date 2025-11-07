import React, { useState, useCallback, useMemo } from 'react';
import { AppStep, Appliance, Technician, SortOption } from './types';
import { APPLIANCES } from './constants';
import { diagnoseAppliance, findNearbyTechnicians } from './services/geminiService';

// --- Helper function to convert file to base64 ---
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });

// --- UI Components defined in the same file for simplicity ---

const Header: React.FC<{ onReset: () => void; showReset: boolean }> = ({ onReset, showReset }) => (
  <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
    <div className="flex items-center gap-3">
        <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm2-4h-2V7h2v6z"/>
        </svg>
        <h1 className="text-xl font-bold text-slate-800">Appliance Aid</h1>
    </div>
    {showReset && (
      <button
        onClick={onReset}
        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        Start Over
      </button>
    )}
  </header>
);

const ApplianceGrid: React.FC<{ onSelect: (appliance: Appliance) => void }> = ({ onSelect }) => (
  <div className="p-4 md:p-6">
    <h2 className="text-2xl font-bold text-slate-700 mb-4">What needs fixing?</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {APPLIANCES.map((app) => (
        <button
          key={app.id}
          onClick={() => onSelect(app)}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition-all active:scale-95 flex flex-col items-center justify-center aspect-square"
        >
          <app.icon className="w-12 h-12 text-blue-600 mb-2" />
          <span className="font-semibold text-center text-slate-700">{app.name}</span>
        </button>
      ))}
    </div>
  </div>
);

const ServiceForm: React.FC<{
  appliance: Appliance;
  onSubmit: (description: string, imageFile: File | null) => void;
}> = ({ appliance, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description, imageFile);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <appliance.icon className="w-10 h-10 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-700">{appliance.name}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">
            Describe the issue
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 'It's making a loud rattling noise and not getting cold.'"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Upload a photo (optional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flex text-sm text-slate-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        {imagePreview && (
          <div className="text-center">
            <img src={imagePreview} alt="Appliance issue preview" className="mx-auto max-h-48 rounded-md" />
          </div>
        )}

        <button
          type="submit"
          disabled={!description.trim()}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          Diagnose Issue
        </button>
      </form>
    </div>
  );
};

const DiagnosisDisplay: React.FC<{ diagnosis: string, onFindTechnician: () => void }> = ({ diagnosis, onFindTechnician }) => {
    const renderMarkdown = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-slate-700">{line.substring(4)}</h3>;
                if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-slate-800">{line.substring(3)}</h2>;
                if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-extrabold mt-8 mb-4 text-slate-900">{line.substring(2)}</h1>;
                if (line.match(/^\d+\.\s/)) return <p key={index} className="ml-5 mb-1">{line}</p>;
                if (line.trim() === '') return <br key={index} />;
                return <p key={index} className="mb-2 text-slate-600">{line}</p>;
            });
    };

    return (
        <div className="p-4 md:p-6">
            <div className="bg-white p-4 rounded-lg shadow-inner">
                {renderMarkdown(diagnosis)}
            </div>
            <div className="mt-6">
                 <button onClick={onFindTechnician} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition-colors">
                    Find a Local Technician
                 </button>
            </div>
        </div>
    );
};

const TechnicianList: React.FC<{
  technicians: Technician[];
  applianceName: string;
  filterQuery: string;
  onFilterChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}> = ({ technicians, applianceName, filterQuery, onFilterChange, sortOption, onSortChange }) => (
    <div className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Nearby Technicians for your {applianceName}</h2>
        
        <div className="mb-4 space-y-3 sm:space-y-0 sm:flex sm:gap-3">
            <input
                type="text"
                value={filterQuery}
                onChange={(e) => onFilterChange(e.target.value)}
                placeholder="Filter by name or address..."
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
             <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="w-full sm:w-auto p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             >
                <option value={SortOption.DEFAULT}>Sort by Relevance</option>
                <option value={SortOption.NAME_AZ}>Sort by Name (A-Z)</option>
            </select>
        </div>

        {technicians.length > 0 ? (
            <div className="space-y-4">
                {technicians.map((tech, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800">{tech.name}</h3>
                        <div className="mt-2 space-y-2 text-slate-600">
                            {tech.address && (
                                <a href={tech.mapsUrl || `https://www.google.com/maps?q=${encodeURIComponent(tech.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
                                    <svg className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-blue-500" xmlns="http://www.w.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    <span>{tech.address}</span>
                                </a>
                            )}
                            {tech.phone && (
                                <a href={`tel:${tech.phone}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
                                    <svg className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-blue-500" xmlns="http://www.w.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                    <span>{tech.phone}</span>
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <p className="text-slate-600">No technicians found matching your criteria.</p>
            </div>
        )}
    </div>
);


const LoadingView: React.FC<{title: string, message: string}> = ({title, message}) => (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
         <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
        <p className="text-slate-500 mt-2">{message}</p>
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_APPLIANCE);
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DEFAULT);


  const handleApplianceSelect = (appliance: Appliance) => {
    setSelectedAppliance(appliance);
    setStep(AppStep.DESCRIBE_ISSUE);
  };

  const handleFormSubmit = useCallback(async (description: string, imageFile: File | null) => {
    if (!selectedAppliance) return;
    setStep(AppStep.DIAGNOSING);
    setError(null);

    try {
      let imagePayload;
      if (imageFile) {
        const base64 = await toBase64(imageFile);
        imagePayload = { base64, mimeType: imageFile.type };
      }

      const result = await diagnoseAppliance(
        selectedAppliance.name,
        description,
        imagePayload
      );
      setDiagnosis(result);
      setStep(AppStep.SHOW_DIAGNOSIS);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setStep(AppStep.DESCRIBE_ISSUE);
    }
  }, [selectedAppliance]);
  
  const handleFindTechnician = useCallback(async () => {
    if (!selectedAppliance) return;

    setStep(AppStep.FINDING_TECHNICIAN);
    setError(null);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const results = await findNearbyTechnicians(selectedAppliance.name, { latitude, longitude });
                if (results.length === 0) {
                    setError("Could not find any technicians nearby. Please try again later.");
                    setStep(AppStep.SHOW_DIAGNOSIS);
                } else {
                    setTechnicians(results);
                    setStep(AppStep.SHOW_TECHNICIANS);
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching technicians.');
                setStep(AppStep.SHOW_DIAGNOSIS);
            }
        },
        (geoError) => {
            console.error("Geolocation error:", geoError);
            setError("Could not get your location. Please enable location services and try again.");
            setStep(AppStep.SHOW_DIAGNOSIS);
        }
    );
  }, [selectedAppliance]);

  const handleReset = () => {
    setStep(AppStep.SELECT_APPLIANCE);
    setSelectedAppliance(null);
    setDiagnosis('');
    setTechnicians([]);
    setError(null);
    setFilterQuery('');
    setSortOption(SortOption.DEFAULT);
  };

  const filteredAndSortedTechnicians = useMemo(() => {
    let filtered = technicians.filter(tech =>
        tech.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        tech.address.toLowerCase().includes(filterQuery.toLowerCase())
    );

    if (sortOption === SortOption.NAME_AZ) {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return filtered;
  }, [technicians, filterQuery, sortOption]);

  const renderStep = () => {
    switch (step) {
      case AppStep.SELECT_APPLIANCE:
        return <ApplianceGrid onSelect={handleApplianceSelect} />;
      case AppStep.DESCRIBE_ISSUE:
        if (selectedAppliance) {
          return <ServiceForm appliance={selectedAppliance} onSubmit={handleFormSubmit} />;
        }
        return null;
      case AppStep.DIAGNOSING:
          return <LoadingView title="Analyzing Issue..." message="Our AI technician is taking a look. This might take a moment."/>;
      case AppStep.SHOW_DIAGNOSIS:
        return <DiagnosisDisplay diagnosis={diagnosis} onFindTechnician={handleFindTechnician} />;
      case AppStep.FINDING_TECHNICIAN:
          return <LoadingView title="Finding Technicians..." message="Searching for qualified repair shops in your area." />;
      case AppStep.SHOW_TECHNICIANS:
          if(selectedAppliance) {
            return <TechnicianList
                        technicians={filteredAndSortedTechnicians}
                        applianceName={selectedAppliance.name}
                        filterQuery={filterQuery}
                        onFilterChange={setFilterQuery}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                    />;
          }
          return null;
      default:
        return <p>Something went wrong.</p>;
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-slate-100 min-h-screen font-sans flex flex-col">
      <Header onReset={handleReset} showReset={step !== AppStep.SELECT_APPLIANCE} />
      <main className="flex-grow pb-4">
        {error && (
            <div className="p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        {renderStep()}
      </main>
    </div>
  );
};

export default App;
