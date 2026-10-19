import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axiosInstance';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    item_id: '',
    property_number: '',
    item_name: '',
    category_id: '',
    status: 'Available'
  });

  const fetchEquipment = async () => {
    try {
      const res = await API.get('/equipment');
      setEquipment(res.data);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/equipment/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      const catObj = categories.find(c => c.category_name === item.category_name);
      setFormData({
        item_id: item.item_id,
        property_number: item.property_number,
        item_name: item.item_name,
        category_id: catObj ? catObj.category_id : '',
        status: item.status
      });
    } else {
      setIsEditing(false);
      setFormData({
        item_id: '',
        property_number: '',
        item_name: '',
        category_id: categories[0]?.category_id || '',
        status: 'Available'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/equipment/${formData.item_id}`, formData);
      } else {
        await API.post('/equipment', formData);
      }
      setShowModal(false);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving equipment item.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await API.delete(`/equipment/${id}`);
        fetchEquipment();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete item.');
      }
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.property_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory ? item.category_name === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': return 'bg-success';
      case 'Borrowed': return 'bg-primary';
      case 'Under Maintenance': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#102a43' }}>Equipment Inventory</h2>
          <small className="text-muted">Manage all school properties and status</small>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-lg me-1"></i> Add Equipment
        </button>
      </div>

      <div className="card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by property number or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_name}>{c.category_name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Property #</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map(item => (
                  <tr key={item.item_id}>
                    <td className="fw-bold">{item.property_number}</td>
                    <td>{item.item_name}</td>
                    <td>{item.category_name}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(item)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.item_id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No equipment found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{isEditing ? 'Edit Equipment' : 'Add New Equipment'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Property Number</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.property_number}
                      onChange={(e) => setFormData({ ...formData, property_number: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Item Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.item_name}
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      className="form-select"
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="Borrowed">Borrowed</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Add Equipment'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Equipment;