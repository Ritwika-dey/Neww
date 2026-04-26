import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [location, setLocation] = useState('')
  const [domain, setDomain] = useState('restaurant')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResults(null)
    try {
      const response = await axios.post('http://localhost:8000/analyze', {
        location,
        business_type: domain
      })
      setResults(response.data)
    } catch (error) {
      console.error("Search failed:", error)
      alert("Failed to fetch leads. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold mb-4 tracking-tight"
          >
            Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Lead Agent</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            Find businesses without websites and generate AI pitches in seconds.
          </motion.p>
        </header>

        {/* Search Form */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-20"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="flex-1 px-4 py-2">
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">City / Location</label>
              <input 
                type="text" 
                placeholder="e.g. Mumbai, Kolkata"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600"
                required
              />
            </div>
            <div className="md:w-px bg-white/10" />
            <div className="flex-1 px-4 py-2">
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Industry / Domain</label>
              <select 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-white cursor-pointer appearance-none"
              >
                <option className="bg-[#08060d]" value="restaurant">Restaurant</option>
                <option className="bg-[#08060d]" value="gym">Gym</option>
                <option className="bg-[#08060d]" value="salon">Salon</option>
                <option className="bg-[#08060d]" value="garment shop">Garment Shop</option>
                <option className="bg-[#08060d]" value="dentist">Dentist</option>
              </select>
            </div>
            <button 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Find Leads'}
            </button>
          </form>
        </motion.section>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Scanning the area for opportunities...</p>
            </motion.div>
          )}

          {results && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Found" value={results.summary.total_found} />
                <StatCard label="Need Website" value={results.summary.need_website} color="text-red-400" />
                <StatCard label="Live Sites" value={results.summary.have_website} color="text-green-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.opportunities.length > 0 ? (
                  results.opportunities.map((lead, idx) => (
                    <LeadCard 
                      key={idx} 
                      lead={lead} 
                      onClick={() => setSelectedLead(lead)} 
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-gray-500 text-lg">No leads found in this area. Try a different city or industry!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Selected Lead Modal Placeholder */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121218] border border-white/10 p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold">{selectedLead.business_name}</h2>
                  <p className="text-gray-400">{selectedLead.research?.business_type || 'Local Business'}</p>
                  
                  {/* Contact Info Badges */}
                  <div className="flex gap-3 mt-4">
                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase">Phone:</span>
                      <span className="text-sm font-medium">{selectedLead.research?.contact_info?.phone || selectedLead.phone || 'Visit store'}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase">Email:</span>
                      <span className="text-sm font-medium">{selectedLead.research?.contact_info?.email || selectedLead.email || 'Not listed'}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pitch Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="p-1.5 bg-purple-500/20 rounded-lg">📧</span> Outreach Pitch
                  </h3>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                      "{selectedLead.outreach?.message || selectedLead.pitch}"
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        const msg = encodeURIComponent(selectedLead.outreach?.whatsapp_message || selectedLead.pitch);
                        window.open(`https://wa.me/?text=${msg}`, '_blank');
                      }}
                      className="flex-1 bg-green-600/20 text-green-400 border border-green-600/30 py-3 rounded-xl hover:bg-green-600/30 transition-all font-medium"
                    >
                      WhatsApp Pitch
                    </button>
                    <button 
                      onClick={() => {
                        const subject = encodeURIComponent(selectedLead.outreach?.subject || `Website for ${selectedLead.business_name}`);
                        const body = encodeURIComponent(selectedLead.outreach?.message || selectedLead.pitch);
                        window.location.href = `mailto:?subject=${subject}&body=${body}`;
                      }}
                      className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 py-3 rounded-xl hover:bg-blue-600/30 transition-all font-medium"
                    >
                      Email Pitch
                    </button>
                  </div>
                </div>

                {/* Pricing Guide */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="p-1.5 bg-yellow-500/20 rounded-lg">💰</span> Pricing Guide
                  </h3>
                  <div className="space-y-3">
                    {selectedLead.pricing?.tiers?.length > 0 ? (
                      selectedLead.pricing.tiers.map((tier, tIdx) => (
                        <div key={tIdx} className={`p-4 rounded-xl border transition-all ${tier.name === selectedLead.pricing.recommended_tier ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-white/5'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold">{tier.name}</span>
                            <span className="text-lg font-bold">${tier.price}</span>
                          </div>
                          <p className="text-xs text-gray-500">{tier.best_for}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                        <p className="text-sm text-gray-500 mb-4">AI pricing failed. Recommended range:</p>
                        <div className="flex justify-between text-sm">
                          <span>Starter: $299</span>
                          <span>Pro: $599</span>
                          <span>Elite: $999</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-lg">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function LeadCard({ lead, onClick }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.08] hover:border-purple-500/30 transition-all backdrop-blur-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-xl shadow-lg">
          {lead.business_name[0]}
        </div>
        {lead.confidence > 0.8 && (
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/20">
            HIGH CONFIDENCE
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{lead.business_name}</h3>
      <p className="text-gray-400 text-sm mb-6 line-clamp-2">{lead.pitch}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-500">Demo ready</span>
        <div className="flex items-center gap-1 text-purple-400 text-sm font-semibold group-hover:gap-2 transition-all">
          View Lead <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </div>
      </div>
    </motion.div>
  )
}

export default App

