document.getElementById('university').addEventListener('change', async function () {
  const universityId = this.value;
  const facultySelect = document.getElementById('faculty');
  const departmentSelect = document.getElementById('department');
  facultySelect.innerHTML = '<option value="">Select Faculty</option>';
  departmentSelect.innerHTML = '<option value="">Select Department</option>';
  if (universityId) {
    const response = await fetch(`/api/faculties/${universityId}`);
    const faculties = await response.json();
    faculties.forEach(faculty => {
      const option = document.createElement('option');
      option.value = faculty.fakulte_id;
      option.textContent = faculty.fakulte_ad;
      facultySelect.appendChild(option);
    });
  }
});

document.getElementById('faculty').addEventListener('change', async function () {
  const facultyId = this.value;
  const departmentSelect = document.getElementById('department');
  departmentSelect.innerHTML = '<option value="">Select Department</option>';
  if (facultyId) {
    const response = await fetch(`/api/departments/${facultyId}`);
    const departments = await response.json();
    departments.forEach(department => {
      const option = document.createElement('option');
      option.value = department.department_id;
      option.textContent = department.bolum_ad;
      departmentSelect.appendChild(option);
    });
  }
});