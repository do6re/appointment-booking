import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/AdminPage.css';

interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  service_type: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

const AdminPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const params = filter === 'all' ? {} : { status: filter };
        const response = await api.get('/admin/appointments', { params });
        setAppointments(response.data);
      } catch (err) {
        setError('Fehler beim Laden der Termine');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter]);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await api.put(`/admin/appointments/${appointmentId}`, { status: newStatus });
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
        )
      );
    } catch (err) {
      setError('Fehler beim Aktualisieren des Termins');
      console.error(err);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (window.confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      try {
        await api.delete(`/admin/appointments/${appointmentId}`);
        setAppointments(appointments.filter((apt) => apt.id !== appointmentId));
      } catch (err) {
        setError('Fehler beim Löschen des Termins');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Wird geladen...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Verwaltung aller Termine</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-buttons">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' && 'Alle'}
            {status === 'pending' && 'Ausstehend'}
            {status === 'confirmed' && 'Bestätigt'}
            {status === 'cancelled' && 'Storniert'}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>Keine Termine gefunden</p>
        </div>
      ) : (
        <div className="appointments-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Dienstleistung</th>
                <th>Datum</th>
                <th>Uhrzeit</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.name}</td>
                  <td>
                    <a href={`mailto:${apt.email}`}>{apt.email}</a>
                  </td>
                  <td>{apt.service_type}</td>
                  <td>{new Date(apt.date).toLocaleDateString('de-DE')}</td>
                  <td>{apt.time}</td>
                  <td>
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      className={`status-select status-${apt.status}`}
                    >
                      <option value="pending">Ausstehend</option>
                      <option value="confirmed">Bestätigt</option>
                      <option value="cancelled">Storniert</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(apt.id)}
                      className="delete-btn"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
