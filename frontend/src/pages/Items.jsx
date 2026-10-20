import { useEffect, useState } from 'react';
import API from '../api/axiosInstance';

const Items = () => {
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [custodians, setCustodians] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'equipment',
    item_code: '',
    name: '',
    description: '',
    category_id: '',
    room_id: '',
    custodian_id: '',
    condition_status: 'good',
    unit_cost: 0
  });

  useEffect(() => {
    fetchInventory();
    fetchMetadata();
  }, [typeFilter]);

  const fetchInventory = async () => {
    try {
      const endpoint = typeFilter === 'all' ? '/items' : `/items?type=${typeFilter}`;
      const res = await API.get(endpoint);
      setItems(res.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [roomRes, userRes] = await Promise.all([
        API.get('/rooms').catch(() => ({ data: [] })),
        API.get('/users').catch(() => ({ data: [] }))
      ]);
      setRooms(roomRes.data || []);
      setCustodians(userRes.data || []);
    } catch (e) {
      console.warn('Metadata fetch fallback:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/items', formData);
      setShowModal(false);
      setFormData({
        type: 'equipment',
        item_code: '',
        name: '',
        description: '',
        category_id: '',
        room_id: '',
        custodian_id: '',
        condition_status: 'good',
        unit_cost: 0
      });
      fetchInventory();
    } catch (err) {
      alert('Failed to save item: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Unified Inventory Management</h4>
        <button className="btn btn-primary rounded-pill px-3" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> Add New Asset
        </button>
      </div>

      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button className={`nav-link ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>
            All Assets
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${typeFilter === 'equipment' ? 'active' : ''}`} onClick={() => setTypeFilter('equipment')}>
            Equipment (Borrowable)
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${typeFilter === 'property' ? 'active' : ''}`} onClick={() => setTypeFilter('property')}>
            Property (Assigned)
          </button>
        </li>
      </ul>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Room / Office</th>
                <th>Custodian</th>
                <th>Status</th>
                <th>Unit Cost</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.item_id}>
                  <td><code>{item.item_code}</code></td>
                  <td className="fw-bold">{item.name}</td>
                  <td>
                    <span className={`badge ${item.type === 'equipment' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.room_name || 'N/A'}</td>
                  <td>{item.custodian_name || 'N/A'}</td>
                  <td>
                    <span className={`badge ${item.status === 'available' ? 'bg-success' : 'bg-primary'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>₱{Number(item.unit_cost || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-3 border-0">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">Register Inventory Asset</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Asset Type Classification</label>
                    <div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="type"
                          id="typeEquip"
                          value="equipment"
                          checked={formData.type === 'equipment'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                        <label className="form-check-label" htmlFor="typeEquip">Equipment (Borrowable)</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="type"
                          id="typeProp"
                          value="property"
                          checked={formData.type === 'property'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                        <label className="form-check-label" htmlFor="typeProp">Property (Non-Borrowable / Assigned)</label>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        {formData.type === 'property' ? 'Property Number' : 'Serial Number / Code'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.item_code}
                        onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    {formData.type === 'property' && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Assigned Room / Office</label>
                          <select
                            className="form-select"
                            value={formData.room_id}
                            onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                          >
                            <option value="">Select Room...</option>
                            {rooms.map((r) => (
                              <option key={r.room_id} value={r.room_id}>
                                {r.room_name} ({r.building})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Accountable Custodian</label>
                          <select
                            className="form-select"
                            value={formData.custodian_id}
                            onChange={(e) => setFormData({ ...formData, custodian_id: e.target.value })}
                          >
                            <option value="">Select Custodian...</option>
                            {custodians.map((u) => (
                              <option key={u.user_id} value={u.user_id}>
                                {u.full_name} ({u.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Unit Cost (₱)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.unit_cost}
                        onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Save Asset</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;