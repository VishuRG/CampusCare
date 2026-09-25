import './index.css'
import StartScreen from "./StartScreen";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, ShieldAlert, Flame, Stethoscope, Wrench, Shield, 
  CheckCircle2, Clock, Users, Activity, Play, Plus, RefreshCw, 
  ChevronRight, ArrowRight, Zap, ListCheck, BarChart3, BellRing, 
  Check, UserCheck, AlertOctagon, Filter, Search, RotateCcw, Volume2, VolumeX,
  MapPin, PhoneCall, Radio, FileText, Info, LogOut, User, Lock, Key, Eye, EyeOff,
  Code2, Download, Database, Send, AlertCircle, Phone, ArrowUpRight
} from 'lucide-react';

const INCIDENT_TYPES = {
  FIRE: { label: 'Fire / Explosion', weight: 40, icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  MEDICAL: { label: 'Medical Emergency', weight: 35, icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  HAZMAT: { label: 'Chemical / Hazmat', weight: 30, icon: AlertOctagon, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  SECURITY: { label: 'Security & Threat', weight: 25, icon: ShieldAlert, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  FACILITY: { label: 'Facility Failure', weight: 10, icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

const HIGH_RISK_KEYWORDS = ['unconscious', 'smoke', 'weapon', 'trapped', 'blood', 'fire', 'explosion', 'toxic', 'gun', 'cardiac', 'collapse', 'bleeding'];
const MEDIUM_RISK_KEYWORDS = ['leak', 'injury', 'broken', 'fight', 'spill', 'glass', 'alarm', 'stuck', 'gas', 'fainting'];

const CAMPUS_LOCATIONS = [
  { name: 'Science & Chemistry Lab 3', riskFactor: 20 },
  { name: 'Main Library - 2nd Floor', riskFactor: 10 },
  { name: 'Student Dormitory - Block A', riskFactor: 15 },
  { name: 'Athletics & Sports Complex', riskFactor: 10 },
  { name: 'Central Dining Hall', riskFactor: 12 },
  { name: 'Administration Building', riskFactor: 5 },
  { name: 'Engineering Workshop B', riskFactor: 18 }
];

const INITIAL_RESPONDERS = [
  { id: 'resp-1', name: 'Dr. Sarah Lin', skill: 'MEDICAL', status: 'AVAILABLE', location: 'Health Center', assignedIncidentId: null, avatar: '👩‍⚕️' },
  { id: 'resp-2', name: 'Officer Mark Vance', skill: 'SECURITY', status: 'AVAILABLE', location: 'Main Gate Desk', assignedIncidentId: null, avatar: '👮' },
  { id: 'resp-3', name: 'Tom Higgins', skill: 'FACILITY', status: 'AVAILABLE', location: 'Maintenance Hub', assignedIncidentId: null, avatar: '🔧' },
  { id: 'resp-4', name: 'Capt. Dave Ross', skill: 'FIRE', status: 'AVAILABLE', location: 'Safety HQ', assignedIncidentId: null, avatar: '👩‍🚒' },
  { id: 'resp-5', name: 'Elena Rostova', skill: 'SECURITY', status: 'AVAILABLE', location: 'North Quad', assignedIncidentId: null, avatar: '👮‍♀️' }
];

const INITIAL_PLAYBOOKS = {
  FIRE: [
    { id: 1, text: 'Trigger sector fire alarm & automated emergency notification broadcast.', done: false },
    { id: 2, text: 'Dispatch Fire Captain & clear emergency vehicle access lane.', done: false },
    { id: 3, text: 'Initiate immediate floor evacuation protocol for impacted building.', done: false },
    { id: 4, text: 'Isolate ventilation units to prevent smoke spreading through HVAC.', done: false },
    { id: 5, text: 'Establish safety perimeter and coordinate with municipal Fire Dept.', done: false }
  ],
  MEDICAL: [
    { id: 1, text: 'Dispatch nearest medical responder with primary trauma kit & AED.', done: false },
    { id: 2, text: 'Guide ambulance to designated campus landing point.', done: false },
    { id: 3, text: 'Clear bystanders and secure area around patient.', done: false },
    { id: 4, text: 'Log patient vitals and contact campus emergency contact.', done: false }
  ],
  HAZMAT: [
    { id: 1, text: 'Evacuate immediate lab/room area; lock down ventilation dampers.', done: false },
    { id: 2, text: 'Dispatch specialized hazmat team with protective suit equipment.', done: false },
    { id: 3, text: 'Identify chemical MSDS safety sheet and neutralizer agent.', done: false },
    { id: 4, text: 'Notify environmental safety coordinator and local hazmat unit.', done: false }
  ],
  SECURITY: [
    { id: 1, text: 'Dispatch campus security officers to location immediately.', done: false },
    { id: 2, text: 'Access CCTV feeds for room/zone for real-time situational awareness.', done: false },
    { id: 3, text: 'Initiate targeted room lockdown or perimeter blockade if required.', done: false },
    { id: 4, text: 'Prepare report for municipal law enforcement dispatch if elevated.', done: false }
  ],
  FACILITY: [
    { id: 1, text: 'Locate main utility shutoff valves/switches if active leak or risk.', done: false },
    { id: 2, text: 'Dispatch facility maintenance unit with repair equipment.', done: false },
    { id: 3, text: 'Post safety warning signage and secure area for slip/hazard risks.', done: false },
    { id: 4, text: 'Inspect structural or system damage and issue repair order.', done: false }
  ]
};

const calculateSeverityScore = (type, description, locationName) => {
  let score = 0;
  
  // 1. Base Weight by Type
  const typeWeight = INCIDENT_TYPES[type]?.weight || 10;
  score += typeWeight;

  // 2. Keyword Detection
  const lowerDesc = (description || '').toLowerCase();
  let keywordBonus = 0;
  
  HIGH_RISK_KEYWORDS.forEach(kw => {
    if (lowerDesc.includes(kw)) keywordBonus += 15;
  });
  MEDIUM_RISK_KEYWORDS.forEach(kw => {
    if (lowerDesc.includes(kw)) keywordBonus += 7;
  });
  score += Math.min(keywordBonus, 40);

  // 3. Location Density Factor
  const locObj = CAMPUS_LOCATIONS.find(l => l.name === locationName);
  if (locObj) {
    score += locObj.riskFactor;
  } else {
    score += 5;
  }

  score = Math.min(Math.max(score, 10), 99);

  let priority = 'LOW';
  if (score >= 75) priority = 'CRITICAL';
  else if (score >= 55) priority = 'HIGH';
  else if (score >= 35) priority = 'MEDIUM';

  return { score, priority };
};

export default function CampusCareApp() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null); // { name, role: 'STUDENT'|'STAFF', ... }
  const [authView, setAuthView] = useState('LOGIN'); // 'LOGIN', 'SIGNUP', 'FORGOT_PASSWORD'
  const [selectedRoleTab, setSelectedRoleTab] = useState('STUDENT'); // 'STUDENT' | 'STAFF'
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Precedence arranged initial JSON mock data
  const [studentDetailsJSON, setStudentDetailsJSON] = useState([
    {
      name: "Aman Sharma",
      collegeRollNumber: "STU2026001",
      classRoomNumber: "302-B",
      course: "B.Tech Computer Science",
      dateOfBirth: "2003-08-15",
      password: "studentPass123",
      phoneNumber: "9876543210"
    }
  ]);

  const [staffDetailsJSON, setStaffDetailsJSON] = useState([
    {
      name: "Dr. Rajesh Verma",
      staffId: "STF1001",
      dateOfBirth: "1980-05-20",
      password: "staffPass123",
      phoneNumber: "9123456789"
    }
  ]);

  // Auth Form Input States
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authMessage, setAuthMessage] = useState(null);

  // Signup Fields State
  const [studentForm, setStudentForm] = useState({
    name: '', collegeRollNumber: '', classRoomNumber: '', course: '', dateOfBirth: '', password: '', phoneNumber: ''
  });
  const [staffForm, setStaffForm] = useState({
    name: '', staffId: '', dateOfBirth: '', password: '', phoneNumber: ''
  });

  // Forgot Password Form State
  const [forgotId, setForgotId] = useState('');
  const [forgotDob, setForgotDob] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Central data.json state store for all campus issues & incidents
  const [dataJSON, setDataJSON] = useState([
    {
      id: 'INC-1001',
      type: 'FACILITY',
      location: 'Main Library - 2nd Floor',
      room: 'Restroom B',
      description: 'Minor water leak under sink causing wet floor.',
      reporter: 'Aman Sharma (STUDENT)',
      reportedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      severityScore: 28,
      priority: 'LOW',
      assignedResponderId: 'resp-3',
      preemptedCount: 0,
      state: 'pending', // 'pending' | 'solved'
      resolvedAt: null,
      resolvedBy: null,
      staffNotification: 'Responder dispatched to location.',
      playbook: JSON.parse(JSON.stringify(INITIAL_PLAYBOOKS.FACILITY))
    },
    {
      id: 'INC-1000',
      type: 'SECURITY',
      location: 'Central Dining Hall',
      room: 'Entrance Gate',
      description: 'Broken latch on door causing entrance block.',
      reporter: 'Aman Sharma (STUDENT)',
      reportedAt: new Date(Date.now() - 120 * 60000).toISOString(),
      severityScore: 15,
      priority: 'LOW',
      assignedResponderId: null,
      preemptedCount: 0,
      state: 'solved', // 'pending' | 'solved'
      resolvedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      resolvedBy: 'Dr. Rajesh Verma (STAFF)',
      staffNotification: 'Door latch repaired and secured by facility team.',
      playbook: JSON.parse(JSON.stringify(INITIAL_PLAYBOOKS.SECURITY))
    }
  ]);

  // JSON Inspector Modal Toggle & Selected File
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [inspectorTab, setInspectorTab] = useState('data.json'); // 'data.json' | 'studentLoginDetails.json' | 'staffLoginDetails.json'

  // Application State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [incidents, setIncidents] = useState([
    {
      id: 'INC-1001',
      type: 'FACILITY',
      location: 'Main Library - 2nd Floor',
      room: 'Restroom B',
      description: 'Minor water leak under sink causing wet floor.',
      reporter: 'Aman Sharma (STUDENT)',
      reportedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      status: 'DISPATCHED',
      severityScore: 28,
      priority: 'LOW',
      assignedResponderId: 'resp-3',
      preemptedCount: 0,
      state: 'pending',
      staffNotification: 'Responder dispatched to location.',
      playbook: JSON.parse(JSON.stringify(INITIAL_PLAYBOOKS.FACILITY))
    }
  ]);

  const [responders, setResponders] = useState(() => {
    return INITIAL_RESPONDERS.map(r => 
      r.id === 'resp-3' ? { ...r, status: 'DISPATCHED', assignedIncidentId: 'INC-1001' } : r
    );
  });

  const [logs, setLogs] = useState([
    { id: 'log-1', timestamp: new Date(Date.now() - 25 * 60000).toLocaleTimeString(), message: 'Incident INC-1001 reported (Facility - Water leak).' },
    { id: 'log-2', timestamp: new Date(Date.now() - 24 * 60000).toLocaleTimeString(), message: 'Auto-dispatched Tom Higgins to INC-1001.' }
  ]);

  // Form State for new incident
  const [formType, setFormType] = useState('FIRE');
  const [formLocation, setFormLocation] = useState(CAMPUS_LOCATIONS[0].name);
  const [formRoom, setFormRoom] = useState('Room 302 - East Wing');
  const [formDesc, setFormDesc] = useState('Heavy smoke and chemical fumes coming from beaker storage station!');
  
  // UI Controls
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-1001');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [preemptionAlert, setPreemptionAlert] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  const addLog = (message, type = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs(prev => [{ id: 'log-' + Date.now() + Math.random(), timestamp: timeStr, message, type }, ...prev]);
  };

  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthMessage(null);

    if (selectedRoleTab === 'STUDENT') {
      const user = studentDetailsJSON.find(
        s => s.collegeRollNumber === loginId && s.password === loginPassword
      );
      if (user) {
        setCurrentUser({ ...user, role: 'STUDENT' });
        setLoginPassword('');
        addLog(`Student User logged in: ${user.name}`);
      } else {
        setAuthMessage({ type: 'error', text: 'Invalid Roll Number or Password!' });
      }
    } else {
      const user = staffDetailsJSON.find(
        s => s.staffId === loginId && s.password === loginPassword
      );
      if (user) {
        setCurrentUser({ ...user, role: 'STAFF' });
        setLoginPassword('');
        addLog(`Staff Member logged in: ${user.name}`);
      } else {
        setAuthMessage({ type: 'error', text: 'Invalid Staff ID or Password!' });
      }
    }
  };

  const handleStudentSignup = (e) => {
    e.preventDefault();
    setAuthMessage(null);

    if (studentDetailsJSON.some(s => s.collegeRollNumber === studentForm.collegeRollNumber)) {
      setAuthMessage({ type: 'error', text: 'Roll Number already registered in studentLoginDetails.json!' });
      return;
    }

    const newStudent = {
      name: studentForm.name,
      collegeRollNumber: studentForm.collegeRollNumber,
      classRoomNumber: studentForm.classRoomNumber,
      course: studentForm.course,
      dateOfBirth: studentForm.dateOfBirth,
      password: studentForm.password,
      phoneNumber: studentForm.phoneNumber
    };

    setStudentDetailsJSON(prev => [...prev, newStudent]);
    setAuthMessage({ type: 'success', text: 'Student Account Registered successfully in studentLoginDetails.json!' });
    setStudentForm({ name: '', collegeRollNumber: '', classRoomNumber: '', course: '', dateOfBirth: '', password: '', phoneNumber: '' });
    setTimeout(() => setAuthView('LOGIN'), 1200);
  };

  const handleStaffSignup = (e) => {
    e.preventDefault();
    setAuthMessage(null);

    if (staffDetailsJSON.some(s => s.staffId === staffForm.staffId)) {
      setAuthMessage({ type: 'error', text: 'Staff ID already registered in staffLoginDetails.json!' });
      return;
    }

    const newStaff = {
      name: staffForm.name,
      staffId: staffForm.staffId,
      dateOfBirth: staffForm.dateOfBirth,
      password: staffForm.password,
      phoneNumber: staffForm.phoneNumber
    };

    setStaffDetailsJSON(prev => [...prev, newStaff]);
    setAuthMessage({ type: 'success', text: 'Staff Account Registered successfully in staffLoginDetails.json!' });
    setStaffForm({ name: '', staffId: '', dateOfBirth: '', password: '', phoneNumber: '' });
    setTimeout(() => setAuthView('LOGIN'), 1200);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setAuthMessage(null);

    if (selectedRoleTab === 'STUDENT') {
      const index = studentDetailsJSON.findIndex(
        s => s.collegeRollNumber === forgotId && s.dateOfBirth === forgotDob
      );
      if (index !== -1) {
        const updated = [...studentDetailsJSON];
        updated[index].password = forgotNewPassword;
        setStudentDetailsJSON(updated);
        setAuthMessage({ type: 'success', text: 'Password reset successful! You can login now.' });
        setTimeout(() => setAuthView('LOGIN'), 1200);
      } else {
        setAuthMessage({ type: 'error', text: 'Verification Failed! Roll Number or Date of Birth did not match.' });
      }
    } else {
      const index = staffDetailsJSON.findIndex(
        s => s.staffId === forgotId && s.dateOfBirth === forgotDob
      );
      if (index !== -1) {
        const updated = [...staffDetailsJSON];
        updated[index].password = forgotNewPassword;
        setStaffDetailsJSON(updated);
        setAuthMessage({ type: 'success', text: 'Password reset successful! You can login now.' });
        setTimeout(() => setAuthView('LOGIN'), 1200);
      } else {
        setAuthMessage({ type: 'error', text: 'Verification Failed! Staff ID or Date of Birth did not match.' });
      }
    }
  };

  const handleCreateIncident = (e) => {
    if (e) e.preventDefault();
    const { score, priority } = calculateSeverityScore(formType, formDesc, formLocation);
    const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    const reporterInfo = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Anonymous Student';

    const newIncident = {
      id: newId,
      type: formType,
      location: formLocation,
      room: formRoom,
      description: formDesc,
      reporter: reporterInfo,
      reportedAt: new Date().toISOString(),
      status: 'REPORTED',
      severityScore: score,
      priority,
      assignedResponderId: null,
      preemptedCount: 0,
      state: 'pending',
      resolvedAt: null,
      resolvedBy: null,
      staffNotification: 'Issue reported and registered in data.json. Awaiting staff review.',
      playbook: JSON.parse(JSON.stringify(INITIAL_PLAYBOOKS[formType] || INITIAL_PLAYBOOKS.FACILITY))
    };

    setIncidents(prev => [newIncident, ...prev]);
    setDataJSON(prev => [newIncident, ...prev]);
    setSelectedIncidentId(newId);

    addLog(`New Issue ${newId} added to data.json with state='pending' (Severity ${score}).`, 'alert');
    playAlertSound();

    triggerSmartDispatch(newIncident);
  };

  const markIncidentAsSolved = (incidentId, customNote = '') => {
    const resolverInfo = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Staff Ops';
    const resolveTime = new Date().toISOString();
    const notificationMsg = customNote || `Issue verified and marked SOLVED by ${resolverInfo}.`;

    setIncidents(prev => prev.map(i => {
      if (i.id === incidentId) {
        if (i.assignedResponderId) {
          freeUpResponder(i.assignedResponderId);
        }
        return { 
          ...i, 
          status: 'RESOLVED',
          state: 'solved',
          resolvedAt: resolveTime,
          resolvedBy: resolverInfo,
          staffNotification: notificationMsg
        };
      }
      return i;
    }));

    setDataJSON(prev => prev.map(item => {
      if (item.id === incidentId) {
        return {
          ...item,
          status: 'RESOLVED',
          state: 'solved',
          resolvedAt: resolveTime,
          resolvedBy: resolverInfo,
          staffNotification: notificationMsg
        };
      }
      return item;
    }));

    addLog(`✅ Issue ${incidentId} marked as 'solved' in data.json by ${resolverInfo}. Student Portal updated!`, 'success');
  };

  const updateIncidentStatus = (incidentId, newStatus) => {
    if (newStatus === 'RESOLVED') {
      markIncidentAsSolved(incidentId);
      return;
    }
    setIncidents(prev => prev.map(i => {
      if (i.id === incidentId) {
        return { ...i, status: newStatus };
      }
      return i;
    }));

    setDataJSON(prev => prev.map(item => item.id === incidentId ? { ...item, status: newStatus } : item));
    addLog(`Issue ${incidentId} status updated to ${newStatus} in data.json.`);
  };

  const triggerSmartDispatch = (targetIncident) => {
    const inc = targetIncident || incidents.find(i => i.id === selectedIncidentId);
    if (!inc || inc.status === 'RESOLVED') return;

    let candidate = responders.find(r => r.status === 'AVAILABLE' && r.skill === inc.type);
    if (!candidate) {
      candidate = responders.find(r => r.status === 'AVAILABLE');
    }

    if (candidate) {
      assignResponderToIncident(candidate.id, inc.id);
      addLog(`Auto-Dispatched ${candidate.name} to ${inc.id}.`, 'success');
      return;
    }

    // Preemption Logic
    const activeAssignments = responders.filter(r => r.status === 'DISPATCHED' || r.status === 'ON_SCENE');
    let preemptCandidate = null;
    let lowestPriorityScore = inc.severityScore;

    activeAssignments.forEach(resp => {
      const currentInc = incidents.find(i => i.id === resp.assignedIncidentId);
      if (currentInc && currentInc.severityScore < lowestPriorityScore - 25) {
        lowestPriorityScore = currentInc.severityScore;
        preemptCandidate = { responder: resp, incident: currentInc };
      }
    });

    if (preemptCandidate) {
      const { responder, incident: lowInc } = preemptCandidate;

      setIncidents(prev => prev.map(i => {
        if (i.id === lowInc.id) {
          return { ...i, status: 'PREEMPTED', assignedResponderId: null, preemptedCount: (i.preemptedCount || 0) + 1 };
        }
        if (i.id === inc.id) {
          return { ...i, status: 'DISPATCHED', assignedResponderId: responder.id };
        }
        return i;
      }));

      setResponders(prev => prev.map(r => {
        if (r.id === responder.id) {
          return { ...r, status: 'DISPATCHED', assignedIncidentId: inc.id };
        }
        return r;
      }));

      setPreemptionAlert({
        highIncId: inc.id,
        lowIncId: lowInc.id,
        responderName: responder.name
      });

      addLog(`🚨 PREEMPTION: Reassigned ${responder.name} from LOW priority (${lowInc.id}) to HIGH priority (${inc.id})!`, 'warning');
      playAlertSound();
    } else {
      setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: 'QUEUED' } : i));
      addLog(`No available responders for ${inc.id}. Incident queued at position #1.`, 'warning');
    }
  };

  const assignResponderToIncident = (responderId, incidentId) => {
    setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, status: 'DISPATCHED', assignedResponderId: responderId } : i));
    setResponders(prev => prev.map(r => r.id === responderId ? { ...r, status: 'DISPATCHED', assignedIncidentId: incidentId } : r));
  };

  const freeUpResponder = (responderId) => {
    setResponders(prev => prev.map(r => r.id === responderId ? { ...r, status: 'AVAILABLE', assignedIncidentId: null } : r));
    addLog(`Responder freed up. System checking queue...`);
  };

  const runScarcityScenario = () => {
    const updatedResponders = INITIAL_RESPONDERS.map((r, idx) => ({
      ...r,
      status: 'DISPATCHED',
      assignedIncidentId: `INC-LOW-0${idx + 1}`
    }));

    const dummyLowIncidents = INITIAL_RESPONDERS.map((r, idx) => ({
      id: `INC-LOW-0${idx + 1}`,
      type: idx % 2 === 0 ? 'FACILITY' : 'SECURITY',
      location: CAMPUS_LOCATIONS[idx % CAMPUS_LOCATIONS.length].name,
      room: 'Main Corridor',
      description: idx % 2 === 0 ? 'Water cooler dripping floor' : 'Noise report from lounge',
      reporter: 'Campus Guard',
      reportedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      status: 'DISPATCHED',
      severityScore: 22 + idx * 3,
      priority: 'LOW',
      assignedResponderId: r.id,
      playbook: JSON.parse(JSON.stringify(INITIAL_PLAYBOOKS.FACILITY))
    }));

    const criticalIncId = `INC-CRIT-${Math.floor(100 + Math.random() * 900)}`;
    const criticalInc = {
      id: criticalIncId,
      type: 'FIRE',
      location: 'Science & Chemistry Lab 3',
      room: 'Chemical Storage 301',
      description: 'EXPLOSION DETECTED! Smoke pouring into hallway, potential toxic fume leak, student trapped!',
      reporter: 'Automated Fire Sensor #41',
      reportedAt: new Date().toISOString(),
      status: 'REPORTED',
      severityScore: 96,
      priority: 'CRITICAL',
      assignedResponderId: null,
      preemptedCount: 0,
      playbook: JSON.parse(JSON.stringify(INITIAL_PLAYBOOKS.FIRE))
    };

    setResponders(updatedResponders);
    setIncidents([criticalInc, ...dummyLowIncidents]);
    setSelectedIncidentId(criticalIncId);
    
    addLog('⚡ SCENARIO INITIALIZED: All responders busy on low priority tasks.', 'info');
    setTimeout(() => triggerSmartDispatch(criticalInc), 600);
  };

  const togglePlaybookStep = (incidentId, stepId) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const updatedPb = inc.playbook.map(st => st.id === stepId ? { ...st, done: !st.done } : st);
        return { ...inc, playbook: updatedPb };
      }
      return inc;
    }));
  };

  const metrics = useMemo(() => {
    const total = dataJSON.length;
    const active = dataJSON.filter(i => i.state === 'pending').length;
    const critical = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
    const preempted = incidents.reduce((acc, curr) => acc + (curr.preemptedCount || 0), 0);
    const resolved = dataJSON.filter(i => i.state === 'solved').length;
    return { total, active, critical, preempted, resolved };
  }, [incidents, dataJSON]);

  const filteredIncidents = useMemo(() => {
    if (filterType === 'ALL') return incidents;
    return incidents.filter(i => i.type === filterType);
  }, [incidents, filterType]);

  const selectedIncident = useMemo(() => {
    return incidents.find(i => i.id === selectedIncidentId);
  }, [incidents, selectedIncidentId]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-rose-500/30">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-2xl shadow-lg shadow-rose-950/50 mb-2">
              <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CAMPUS<span className="text-rose-500">CARE</span>
            </h1>
            <p className="text-xs text-slate-400">Incident Response & Crisis Management System</p>
          </div>

          {/* Quick Inspector Access */}
          <button 
            // onClick={() => { setInspectorTab('data.json'); setShowInspectorModal(true); }}
            // className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition"
          >
            {/* <Code2 className="w-4 h-4 text-rose-400" /> */}
            {/* <span>Inspect Central JSON Stores (`data.json`)</span> */}
          </button>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setSelectedRoleTab('STUDENT')}
              className={`py-2 rounded-xl transition ${selectedRoleTab === 'STUDENT' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🎓 Student Portal
            </button>
            <button
              onClick={() => setSelectedRoleTab('STAFF')}
              className={`py-2 rounded-xl transition ${selectedRoleTab === 'STAFF' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🛡️ Staff / Security
            </button>
          </div>

          {authMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              authMessage.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authMessage.text}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authView === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {selectedRoleTab === 'STUDENT' ? 'College Roll Number' : 'Staff Identification ID'}
                </label>
                <input 
                  type="text" 
                  required
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder={selectedRoleTab === 'STUDENT' ? 'e.g. STU2026001' : 'e.g. STF1001'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Account Password</label>
                <input 
                  type="password" 
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button 
                  type="button"
                  onClick={() => { setAuthView('FORGOT_PASSWORD'); setAuthMessage(null); }}
                  className="text-rose-400 hover:underline"
                >
                  Forgot Password?
                </button>
                <button 
                  type="button"
                  onClick={() => { setAuthView('SIGNUP'); setAuthMessage(null); }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Create New Account
                </button>
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-rose-950/40 mt-2"
              >
                Sign In to {selectedRoleTab === 'STUDENT' ? 'Student Portal' : 'Staff Operations Console'}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {authView === 'SIGNUP' && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="font-bold text-sm text-slate-200">
                  Create {selectedRoleTab} Account
                </h3>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded">
                  {selectedRoleTab === 'STUDENT' ? 'studentLoginDetails.json' : 'staffLoginDetails.json'}
                </span>
              </div>

              {selectedRoleTab === 'STUDENT' ? (
                <form onSubmit={handleStudentSignup} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name</label>
                    <input 
                      type="text" required value={studentForm.name}
                      onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                      placeholder="e.g. Aman Sharma"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">College Roll Number</label>
                    <input 
                      type="text" required value={studentForm.collegeRollNumber}
                      onChange={e => setStudentForm({...studentForm, collegeRollNumber: e.target.value})}
                      placeholder="e.g. STU2026001"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Class Room No.</label>
                      <input 
                        type="text" required value={studentForm.classRoomNumber}
                        onChange={e => setStudentForm({...studentForm, classRoomNumber: e.target.value})}
                        placeholder="302-B"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Course</label>
                      <input 
                        type="text" required value={studentForm.course}
                        onChange={e => setStudentForm({...studentForm, course: e.target.value})}
                        placeholder="B.Tech CS"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Date Of Birth</label>
                    <input 
                      type="date" required value={studentForm.dateOfBirth}
                      onChange={e => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Password</label>
                    <input 
                      type="password" required value={studentForm.password}
                      onChange={e => setStudentForm({...studentForm, password: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Phone Number</label>
                    <input 
                      type="tel" required value={studentForm.phoneNumber}
                      onChange={e => setStudentForm({...studentForm, phoneNumber: e.target.value})}
                      placeholder="9876543210"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button 
                      type="button" 
                      onClick={() => setAuthView('LOGIN')}
                      className="text-slate-400 hover:underline text-[11px]"
                    >
                      Back to Login
                    </button>
                    <button 
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-xl"
                    >
                      Save Account
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleStaffSignup} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name</label>
                    <input 
                      type="text" required value={staffForm.name}
                      onChange={e => setStaffForm({...staffForm, name: e.target.value})}
                      placeholder="e.g. Dr. Rajesh Verma"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Staff ID</label>
                    <input 
                      type="text" required value={staffForm.staffId}
                      onChange={e => setStaffForm({...staffForm, staffId: e.target.value})}
                      placeholder="e.g. STF1001"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Date Of Birth</label>
                    <input 
                      type="date" required value={staffForm.dateOfBirth}
                      onChange={e => setStaffForm({...staffForm, dateOfBirth: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Password</label>
                    <input 
                      type="password" required value={staffForm.password}
                      onChange={e => setStaffForm({...staffForm, password: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Phone Number</label>
                    <input 
                      type="tel" required value={staffForm.phoneNumber}
                      onChange={e => setStaffForm({...staffForm, phoneNumber: e.target.value})}
                      placeholder="9123456789"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button 
                      type="button" 
                      onClick={() => setAuthView('LOGIN')}
                      className="text-slate-400 hover:underline text-[11px]"
                    >
                      Back to Login
                    </button>
                    <button 
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-xl"
                    >
                      Save Account
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authView === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPassword} className="space-y-3 text-xs">
              <h3 className="font-bold text-sm text-slate-200 pb-2 border-b border-slate-800">
                Reset Password ({selectedRoleTab})
              </h3>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {selectedRoleTab === 'STUDENT' ? 'College Roll Number' : 'Staff ID'}
                </label>
                <input 
                  type="text" required value={forgotId}
                  onChange={e => setForgotId(e.target.value)}
                  placeholder={selectedRoleTab === 'STUDENT' ? 'STU2026001' : 'STF1001'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Date of Birth Verification</label>
                <input 
                  type="date" required value={forgotDob}
                  onChange={e => setForgotDob(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Enter New Password</label>
                <input 
                  type="password" required value={forgotNewPassword}
                  onChange={e => setForgotNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button 
                  type="button" 
                  onClick={() => setAuthView('LOGIN')}
                  className="text-slate-400 hover:underline text-[11px]"
                >
                  Back to Login
                </button>
                <button 
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

        </div>

        {/* JSON Inspector Modal */}
        {showInspectorModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-sm text-slate-100">Virtual JSON Files Inspector</h3>
                </div>
                <button 
                  onClick={() => setShowInspectorModal(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block mb-1">📂 studentLoginDetails.json</span>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto text-[11px]">
                    {JSON.stringify(studentDetailsJSON, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">📂 staffLoginDetails.json</span>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-blue-400 overflow-x-auto text-[11px]">
                    {JSON.stringify(staffDetailsJSON, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Top Navigation Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CAMPUS<span className="text-rose-500">CARE</span>
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                currentUser.role === 'STAFF' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {currentUser.role} PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-400">Welcome, {currentUser.name}</p>
          </div>
        </div>

        {/* Global Controls & User Actions */}
        <div className="flex items-center space-x-3">
          <button 
            // onClick={() => setShowInspectorModal(true)}
            // className="hidden sm:flex items-center space-x-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs"
          >
            {/* <Code2 className="w-3.5 h-3.5 text-rose-400" /> */}
            {/* <span>Inspect `data.json`</span> */}
          </button>

          {currentUser.role === 'STAFF' && (
            <button 
              onClick={runScarcityScenario}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-medium text-xs px-3 py-2 rounded-xl transition shadow-md border border-amber-400/20"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Simulate Preemption</span>
            </button>
          )}

          <button
            onClick={() => setCurrentUser(null)}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-4 flex space-x-1 sm:space-x-4 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition ${activeTab === 'dashboard' ? 'border-rose-500 text-rose-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Activity className="w-4 h-4" />
          <span>{currentUser.role === 'STUDENT' ? 'Emergency Portal & SOS' : 'Live Dispatch Operations'}</span>
        </button>

        {currentUser.role === 'STAFF' && (
          <>
            <button
              onClick={() => setActiveTab('responders')}
              className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition ${activeTab === 'responders' ? 'border-rose-500 text-rose-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Users className="w-4 h-4" />
              <span>Responder Fleet ({responders.filter(r => r.status === 'AVAILABLE').length} Avail)</span>
            </button>
            <button
              onClick={() => setActiveTab('playbooks')}
              className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition ${activeTab === 'playbooks' ? 'border-rose-500 text-rose-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <ListCheck className="w-4 h-4" />
              <span>Emergency Action Playbooks</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-4 flex items-center space-x-2 border-b-2 transition ${activeTab === 'analytics' ? 'border-rose-500 text-rose-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Audit Logs</span>
            </button>
          </>
        )}
      </div>

      {/* Main Content Body */}
      <main className="flex-1 p-4 max-w-[1700px] w-full mx-auto">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* Left Column: Incident Submission Form */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h2 className="font-semibold text-sm flex items-center space-x-2 text-slate-200">
                    <Plus className="w-4 h-4 text-rose-500" />
                    <span>Report Emergency Incident</span>
                  </h2>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    AUTO-PRIORITY
                  </span>
                </div>

                <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Incident Category</label>
                    <select 
                      value={formType} 
                      onChange={e => setFormType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                    >
                      {Object.keys(INCIDENT_TYPES).map(k => (
                        <option key={k} value={k}>{INCIDENT_TYPES[k].label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Campus Location Zone</label>
                    <select 
                      value={formLocation} 
                      onChange={e => setFormLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                    >
                      {CAMPUS_LOCATIONS.map(loc => (
                        <option key={loc.name} value={loc.name}>{loc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Specific Room / Spot</label>
                    <input 
                      type="text"
                      value={formRoom}
                      onChange={e => setFormRoom(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                      placeholder="e.g. Room 302 or East Wing"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Incident Description & Factual Notes</label>
                    <textarea 
                      rows={3}
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-rose-500"
                      placeholder="Describe the emergency..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Emergency Report</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Middle Column: Active Incident Stream */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center space-x-2 text-slate-200">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>
                    {currentUser.role === 'STUDENT' ? 'Active Campus Issues (`data.json`)' : 'Live Incident Queue'} ({filteredIncidents.filter(i => i.state === 'pending').length} Active)
                  </span>
                </h2>

                <select 
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1"
                >
                  <option value="ALL">All Categories</option>
                  <option value="FIRE">Fire</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="SECURITY">Security</option>
                  <option value="FACILITY">Facility</option>
                </select>
              </div>

              {currentUser.role === 'STUDENT' && (
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-1.5">
                    <span className="flex items-center space-x-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                      <span>Live Sync with Staff Operations (`data.json`)</span>
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                      SYNC ACTIVE
                    </span>
                  </div>
                  
                  {dataJSON.filter(d => d.state === 'solved').length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 block font-semibold">RECENTLY SOLVED BY STAFF:</span>
                      {dataJSON.filter(d => d.state === 'solved').slice(0, 2).map(solvedItem => (
                        <div key={solvedItem.id} className="bg-emerald-950/20 border border-emerald-500/30 p-2 rounded-xl flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[11px] font-bold text-emerald-300">{solvedItem.id}</span>
                              <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-bold uppercase">SOLVED</span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">{solvedItem.location} - {solvedItem.description}</p>
                            <span className="text-[10px] text-emerald-400 block mt-1">
                              💬 Staff Note: {solvedItem.staffNotification}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
                {filteredIncidents
                  .filter(inc => currentUser.role === 'STUDENT' ? inc.state === 'pending' : true)
                  .sort((a, b) => b.severityScore - a.severityScore)
                  .map(inc => {
                    const TypeIcon = INCIDENT_TYPES[inc.type]?.icon || AlertTriangle;
                    const isSelected = selectedIncidentId === inc.id;

                    return (
                      <div 
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
                          isSelected 
                            ? 'bg-slate-900 border-rose-500/80 shadow-lg shadow-rose-950/30' 
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                          inc.state === 'solved' ? 'bg-emerald-500' :
                          inc.priority === 'CRITICAL' ? 'bg-red-500' :
                          inc.priority === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />

                        <div className="pl-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1.5 rounded-lg ${INCIDENT_TYPES[inc.type]?.bg}`}>
                                <TypeIcon className={`w-4 h-4 ${INCIDENT_TYPES[inc.type]?.color}`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-xs font-bold text-slate-200">{inc.id}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    inc.state === 'solved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                                  }`}>
                                    {inc.state === 'solved' ? 'SOLVED' : inc.priority}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 block">{inc.location}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-mono text-sm font-bold text-amber-400">{inc.severityScore}</span>
                              <span className="text-[9px] text-slate-500 block">SCORE</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 mt-2 line-clamp-2 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60">
                            {inc.description}
                          </p>

                          <div className="mt-3 flex items-center justify-between text-[11px]">
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              inc.state === 'solved' ? 'bg-emerald-500/20 text-emerald-300' :
                              inc.status === 'PREEMPTED' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              inc.status === 'DISPATCHED' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              STATE: {inc.state?.toUpperCase() || 'PENDING'} ({inc.status})
                            </span>
                            <span className="text-slate-400 text-[10px]">By: {inc.reporter}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Column: Console Details */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="font-semibold text-sm flex items-center space-x-2 text-slate-200">
                <Info className="w-4 h-4 text-blue-400" />
                <span>Incident Operations Console</span>
              </h2>

              {selectedIncident ? (
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-rose-400">{selectedIncident.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          selectedIncident.state === 'solved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {selectedIncident.state === 'solved' ? 'STATE: SOLVED' : 'STATE: PENDING'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-sm mt-0.5">{selectedIncident.location}</h3>
                      <p className="text-xs text-slate-400">{selectedIncident.room}</p>
                    </div>

                    {currentUser.role === 'STAFF' && (
                      <button 
                        onClick={() => markIncidentAsSolved(selectedIncident.id, 'Resolved and verified by staff operations.')}
                        disabled={selectedIncident.state === 'solved'}
                        className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition disabled:opacity-40 flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{selectedIncident.state === 'solved' ? 'Marked Solved' : 'Mark Solved'}</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-400 mb-1">REPORTED DETAILS</h4>
                    <p className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-200">
                      "{selectedIncident.description}"
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">NOTIFY STUDENT PORTAL STATUS</span>
                    <p className="text-xs text-rose-300 font-mono">
                      {selectedIncident.staffNotification || 'Pending staff update...'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center space-x-1">
                      <ListCheck className="w-3.5 h-3.5 text-rose-500" />
                      <span>RECOMMENDED RESPONSE ACTION PROTOCOL</span>
                    </h4>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                      {selectedIncident.playbook?.map((step) => (
                        <div 
                          key={step.id}
                          onClick={() => currentUser.role === 'STAFF' && togglePlaybookStep(selectedIncident.id, step.id)}
                          className={`p-2 rounded-lg border flex items-start space-x-2 transition ${
                            step.done 
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          } ${currentUser.role === 'STAFF' ? 'cursor-pointer' : ''}`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            step.done ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                          }`}>
                            {step.done && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-[11px] ${step.done ? 'line-through text-slate-500' : ''}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center text-slate-500 text-xs">
                  Select an incident to view details.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Responders Tab View */}
        {activeTab === 'responders' && currentUser.role === 'STAFF' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {responders.map(resp => (
              <div key={resp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl p-2 bg-slate-950 rounded-xl border border-slate-800">{resp.avatar}</span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{resp.name}</h3>
                      <span className="text-xs text-slate-400">{resp.skill} Specialist</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    resp.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {resp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Playbooks Management Tab */}
        {activeTab === 'playbooks' && currentUser.role === 'STAFF' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(INITIAL_PLAYBOOKS).map(cat => (
              <div key={cat} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-sm text-rose-400 flex items-center space-x-2">
                  <ListCheck className="w-4 h-4 text-rose-500" />
                  <span>{INCIDENT_TYPES[cat]?.label || cat} Action Plan</span>
                </h3>
                <div className="space-y-1.5 text-xs">
                  {INITIAL_PLAYBOOKS[cat].map(step => (
                    <div key={step.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300 flex items-center space-x-2">
                      <span className="font-mono text-xs text-slate-500">{step.id}.</span>
                      <span>{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab View */}
        {activeTab === 'analytics' && currentUser.role === 'STAFF' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 block">TOTAL INCIDENTS</span>
                <span className="font-mono text-2xl font-bold text-slate-100">{metrics.total}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 block">ACTIVE QUEUE</span>
                <span className="font-mono text-2xl font-bold text-amber-400">{metrics.active}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 block">PREEMPTION EVENTS</span>
                <span className="font-mono text-2xl font-bold text-purple-400">{metrics.preempted}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 block">RESOLVED INCIDENTS</span>
                <span className="font-mono text-2xl font-bold text-emerald-400">{metrics.resolved}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="text-slate-300 border-b border-slate-900 pb-1">
                  <span className="text-slate-500 text-[10px] mr-2">{log.timestamp}</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* JSON Inspector Modal */}
      {showInspectorModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-100">Virtual JSON Stores Inspector</h3>
              </div>
              <button 
                onClick={() => setShowInspectorModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex space-x-2 bg-slate-950 p-1 rounded-xl text-xs font-mono">
              <button
                onClick={() => setInspectorTab('data.json')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                  inspectorTab === 'data.json' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📂 data.json ({dataJSON.length})</span>
              </button>
              <button
                onClick={() => setInspectorTab('studentLoginDetails.json')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                  inspectorTab === 'studentLoginDetails.json' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📂 studentLoginDetails.json</span>
              </button>
              <button
                onClick={() => setInspectorTab('staffLoginDetails.json')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                  inspectorTab === 'staffLoginDetails.json' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📂 staffLoginDetails.json</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {inspectorTab === 'data.json' && (
                <div>
                  <div className="flex items-center justify-between mb-2 text-slate-400 text-[11px]">
                    <span>Central Issue Registry with `state: "pending" | "solved"`</span>
                    <span className="text-emerald-400 font-bold">
                      Pending: {dataJSON.filter(d => d.state === 'pending').length} | Solved: {dataJSON.filter(d => d.state === 'solved').length}
                    </span>
                  </div>
                  <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-amber-300 overflow-x-auto text-[11px] max-h-96">
                    {JSON.stringify(dataJSON, null, 2)}
                  </pre>
                </div>
              )}

              {inspectorTab === 'studentLoginDetails.json' && (
                <div>
                  <span className="text-slate-400 block mb-1">📂 studentLoginDetails.json (Student Accounts)</span>
                  <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto text-[11px] max-h-96">
                    {JSON.stringify(studentDetailsJSON, null, 2)}
                  </pre>
                </div>
              )}

              {inspectorTab === 'staffLoginDetails.json' && (
                <div>
                  <span className="text-slate-400 block mb-1">📂 staffLoginDetails.json (Staff Accounts)</span>
                  <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-blue-400 overflow-x-auto text-[11px] max-h-96">
                    {JSON.stringify(staffDetailsJSON, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}