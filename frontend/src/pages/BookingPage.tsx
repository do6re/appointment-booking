import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import api from '../services/api';
import 'react-calendar/dist/Calendar.css';
import '../styles/BookingPage.css';

interface Service {
  id: string;
  name: string;
  description: string;
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'service' | 'date' | 'form'>('service');

  // Form data
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  // Load services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data);
      } catch (err) {
        setError('Fehler beim Laden der Dienstleistungen');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      const fetchSlots = async () => {
        try {
          const dateStr = selectedDate.toISOString().split('T')[0];
          const response = await api.get('/appointments/available', {
            params: { date: dateStr, service_type: selectedService },
          });
          setAvailableSlots(response.data.slots);
          setSelectedSlot('');
        } catch (err) {
          setError('Fehler beim Laden der verfügbaren Zeiten');
          console.error(err);
        }
      };
      fetchSlots();
    }
  }, [selectedDate, selectedService]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep('date');
  };

  const handleDateSelect = (date: Date) => {
    // Disable Sundays and Saturdays
    if (date.getDay() === 0 || date.getDay() === 6) {
      setError('Samstag und Sonntag sind nicht verfügbar');
      return;
    }

    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      setError('Bitte wählen Sie ein zukünftiges Datum');
      return;
    }

    setSelectedDate(date);
    setError('');
    if (availableSlots.length > 0) {
      setStep('form');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    setSubmitting(true);
    try {
      const dateStr = selectedDate!.toISOString().split('T')[0];
      const response = await api.post('/appointments', {
        name: formData.name,
        email: formData.email,
        date: dateStr,
        time: selectedSlot,
        service_type: services.find((s) => s.id === selectedService)?.name,
      });

      navigate(`/confirmation/${response.data.appointmentId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler bei der Buchung');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Wird geladen...</div>;
  }

  return (
    <div className="booking-container">
      <div className="booking-card">
        <div className="header">
          <h1>Terminbuchung</h1>
          <p>Entrümpelungsservice</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <div className="step">
            <h2>1. Wählen Sie eine Dienstleistung</h2>
            <div className="services-grid">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date Selection */}
        {step === 'date' && (
          <div className="step">
            <h2>2. Wählen Sie ein Datum</h2>
            <div className="calendar-wrapper">
              <Calendar
                onChange={handleDateSelect}
                value={selectedDate}
                minDate={new Date()}
                locale="de-DE"
              />
            </div>
            {selectedDate && (
              <div className="selected-info">
                <p>Ausgewähltes Datum: {selectedDate.toLocaleDateString('de-DE')}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Time and Form */}
        {step === 'form' && (
          <div className="step">
            <h2>3. Wählen Sie eine Uhrzeit und geben Sie Ihre Daten ein</h2>

            {availableSlots.length > 0 ? (
              <>
                <div className="time-slots">
                  <label>Verfügbare Zeiten:</label>
                  <div className="slots-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot} Uhr
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ihr vollständiger Name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">E-Mail *</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ihre.email@example.com"
                      required
                    />
                  </div>

                  <div className="form-summary">
                    <p>
                      <strong>Dienstleistung:</strong> {services.find((s) => s.id === selectedService)?.name}
                    </p>
                    <p>
                      <strong>Datum:</strong> {selectedDate?.toLocaleDateString('de-DE')}
                    </p>
                    <p>
                      <strong>Uhrzeit:</strong> {selectedSlot} Uhr
                    </p>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setStep('date')}
                      className="btn-secondary"
                    >
                      ← Zurück
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!selectedSlot || submitting}
                    >
                      {submitting ? 'Wird gebucht...' : 'Jetzt buchen'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="no-slots">
                <p>Keine verfügbaren Zeitfenster für dieses Datum</p>
                <button
                  onClick={() => setStep('date')}
                  className="btn-secondary"
                >
                  ← Anderes Datum wählen
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
