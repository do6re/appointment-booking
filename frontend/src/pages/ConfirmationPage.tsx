import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/ConfirmationPage.css';

interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  service_type: string;
  created_at: string;
}

const ConfirmationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/appointments/${appointmentId}`);
        setAppointment(response.data);
      } catch (err) {
        setError('Termin konnte nicht geladen werden');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  if (loading) {
    return <div className="loading">Wird geladen...</div>;
  }

  if (error || !appointment) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-card error">
          <h1>❌ Fehler</h1>
          <p>{error}</p>
          <Link to="/" className="btn-primary">
            Zurück zur Buchung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card success">
        <div className="success-icon">✓</div>
        <h1>Termin erfolgreich gebucht!</h1>
        <p>Eine Bestätigung wurde an Ihre E-Mail-Adresse gesendet.</p>

        <div className="appointment-details">
          <div className="detail-item">
            <span className="label">Name:</span>
            <span className="value">{appointment.name}</span>
          </div>
          <div className="detail-item">
            <span className="label">E-Mail:</span>
            <span className="value">{appointment.email}</span>
          </div>
          <div className="detail-item">
            <span className="label">Dienstleistung:</span>
            <span className="value">{appointment.service_type}</span>
          </div>
          <div className="detail-item">
            <span className="label">Datum:</span>
            <span className="value">{new Date(appointment.date).toLocaleDateString('de-DE')}</span>
          </div>
          <div className="detail-item">
            <span className="label">Uhrzeit:</span>
            <span className="value">{appointment.time} Uhr</span>
          </div>
          <div className="detail-item">
            <span className="label">Termin-ID:</span>
            <span className="value code">{appointment.id}</span>
          </div>
        </div>

        <div className="confirmation-message">
          <h3>Wichtig:</h3>
          <ul>
            <li>Prüfen Sie Ihr E-Mail-Postfach auf die Bestätigung</li>
            <li>Bitte seien Sie 10 Minuten vor dem Termin bereit</li>
            <li>Bei Fragen kontaktieren Sie uns bitte per E-Mail</li>
          </ul>
        </div>

        <Link to="/" className="btn-primary">
          Neuen Termin buchen
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;
