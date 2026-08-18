import { useEffect, useState } from 'react';
import { getTagAnalytics } from '../services/candidateService';
import { TAG_COLORS } from '../constants/tags';

const TagAnalytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getTagAnalytics();
        setData(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tag analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (loading) return <div className="p-3">Loading...</div>;
  if (error) return <div className="p-3 text-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0">Candidate Tags</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Tag</th>
                <th className="text-end">Count</th>
                <th className="text-end">%</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => {
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={item.tag}>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: TAG_COLORS[item.tag] || '#757575',
                            color: '#000',
                            fontSize: '0.9rem',
                            padding: '0.5rem 0.75rem',
                          }}
                        >
                          {item.tag}
                        </span>
                      </td>
                      <td className="text-end fw-bold">{item.count}</td>
                      <td className="text-end">{percentage}%</td>
                      <td>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: TAG_COLORS[item.tag] || '#757575',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">
                    No tags assigned yet
                  </td>
                </tr>
              )}
            </tbody>
            {data.length > 0 && (
              <tfoot>
                <tr>
                  <td className="fw-bold">Total</td>
                  <td className="text-end fw-bold">{total}</td>
                  <td className="text-end fw-bold">100%</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default TagAnalytics;
