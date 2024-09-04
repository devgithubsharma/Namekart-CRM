import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, rowsPerPage, onRowsPerPageChange }) => {
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', gap: '8px' }}>
      <button
        style={{
          padding: '4px 8px',
          margin: 0,
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          backgroundColor: currentPage === 1 ? '#f0f0f0' : 'white',
        }}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &lt; Back
      </button>
      {visiblePages.map((number, index) =>
        typeof number === 'number' ? (
          <button
            key={index}
            style={{
              padding: '4px 8px',
              margin: 0,
              fontSize: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: currentPage === number ? 'black' : 'white',
              color: currentPage === number ? 'white' : 'black',
            }}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ) : (
          <span key={index} style={{ padding: '4px 8px', fontSize: '12px' }}>
            {number}
          </span>
        )
      )}
      <button
        style={{
          padding: '4px 8px',
          margin: 0,
          fontSize: '12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          backgroundColor: currentPage === totalPages ? '#f0f0f0' : 'white',
        }}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next &gt;
      </button>
      <span style={{ padding: '4px 8px', fontSize: '12px' }}>Results per page</span>
      <select
        value={rowsPerPage}
        onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        style={{ border: '1px solid #ccc', fontSize: '12px', borderRadius: '4px', padding: '4px 8px' }}
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  );
};

export default Pagination;
