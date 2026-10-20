import { useEffect, useState } from 'react';
import API from '../api/axiosInstance';

const Reports = () => {
  const [roomReports, setRoomReports] = useState([]);
  const [custodianReports, setCustodianReports] = useState([]);
  const [activeTab, setActiveTab] = useState('room');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [roomRes, custRes] = await Promise.all([
        API.get('/reports/property-by-room').catch(() => ({ data: [] })),
        API.get('/reports/property-by-custodian').catch(() => ({ data: [] }))
      ]);
      setRoomReports(roomRes.data || []);
      setCustodianReports(custRes.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">Property Valuation & Accountability Reports</h4>

      <div className="btn-group mb-4">
        <button
          className={`btn btn-outline-primary ${activeTab === 'room' ? 'active' : ''}`}
          onClick={() => setActiveTab('room')}
        >
          Property Inventory by Room
        </button>
        <button
          className={`btn btn-outline-primary ${activeTab === 'custodian' ? 'active' : ''}`}
          onClick={() => setActiveTab('custodian')}
        >
          Property by Custodian
        </button>
      </div>

      {activeTab === 'room' ? (
        <div className="card border-0 shadow-sm p-4 rounded-3">
          <h6 className="fw-bold mb-3">Property Asset Valuation by Room</h6>
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Building</th>
                <th>Property Count</th>
                <th>Total Valuation (₱)</th>
              </tr>
            </thead>
            <tbody>
              {roomReports.map((r) => (
                <tr key={r.room_id}>
                  <td className="fw-bold">{r.room_name}</td>
                  <td>{r.building}</td>
                  <td><span className="badge bg-secondary">{r.total_property_items}</span></td>
                  <td className="fw-bold text-success">₱{Number(r.total_room_valuation || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-4 rounded-3">
          <h6 className="fw-bold mb-3">Custodian Accountability Report</h6>
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Custodian Name</th>
                <th>Assigned Items</th>
                <th>Total Asset Value (₱)</th>
              </tr>
            </thead>
            <tbody>
              {custodianReports.map((c) => (
                <tr key={c.user_id}>
                  <td className="fw-bold">{c.custodian_name}</td>
                  <td><span className="badge bg-primary">{c.assigned_count}</span></td>
                  <td className="fw-bold text-success">₱{Number(c.total_asset_value || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;