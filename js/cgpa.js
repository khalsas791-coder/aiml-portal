/* ============================================================
   CGPA CALCULATOR
   ============================================================ */

const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7,
  'B': 6, 'C': 5, 'P': 4, 'F': 0
};

let rowCount = 0;

function createCGPARow(index) {
  const row = document.createElement('div');
  row.className = 'cgpa-row';
  row.dataset.row = index;
  row.innerHTML = `
    <input class="input-glass subject-name-input" type="text" placeholder="Subject name (optional)" />
    <input class="input-glass" type="number" min="1" max="5" value="4" placeholder="Credits" />
    <select class="input-glass">
      <option value="O">O (Outstanding - 10)</option>
      <option value="A+" selected>A+ (9)</option>
      <option value="A">A (8)</option>
      <option value="B+">B+ (7)</option>
      <option value="B">B (6)</option>
      <option value="C">C (5)</option>
      <option value="P">P (Pass - 4)</option>
      <option value="F">F (Fail - 0)</option>
    </select>
    <button class="cgpa-remove-btn" onclick="removeCGPARow(this)" title="Remove">✕</button>
  `;

  // Live recalculate on change
  row.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', calculateCGPA);
    el.addEventListener('change', calculateCGPA);
  });

  return row;
}

function addCGPARow() {
  const container = document.getElementById('cgpa-rows');
  if (!container) return;
  rowCount++;
  container.appendChild(createCGPARow(rowCount));
  calculateCGPA();
}

function removeCGPARow(btn) {
  const row = btn.closest('.cgpa-row');
  if (!row) return;
  const container = document.getElementById('cgpa-rows');
  if (container.children.length <= 1) {
    window.showToast && showToast('At least one subject required', 'warning');
    return;
  }
  row.style.transition = 'opacity 0.2s, transform 0.2s';
  row.style.opacity = '0';
  row.style.transform = 'translateX(-20px)';
  setTimeout(() => { row.remove(); calculateCGPA(); }, 250);
}

function calculateCGPA() {
  const container = document.getElementById('cgpa-rows');
  if (!container) return;

  let totalPoints = 0, totalCredits = 0;
  const rows = container.querySelectorAll('.cgpa-row');

  rows.forEach(row => {
    const creditInput = row.querySelectorAll('input')[1];
    const gradeSelect = row.querySelector('select');
    if (!creditInput || !gradeSelect) return;
    const credits = parseFloat(creditInput.value) || 0;
    const grade   = gradeSelect.value;
    const points  = GRADE_POINTS[grade] ?? 0;
    totalCredits += credits;
    totalPoints  += credits * points;
  });

  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  updateCGPADisplay(cgpa, totalCredits, rows.length);
}

function updateCGPADisplay(cgpa, totalCredits, subjectCount) {
  const bigNum   = document.getElementById('cgpa-big-number');
  const gradeEl  = document.getElementById('cgpa-grade');
  const credEl   = document.getElementById('cgpa-total-credits');
  const subjEl   = document.getElementById('cgpa-subject-count');
  const circFill = document.getElementById('cgpa-circle-fill');
  const percentage = document.getElementById('cgpa-percentage');

  if (bigNum) bigNum.textContent = cgpa.toFixed(2);
  if (credEl) credEl.textContent = totalCredits;
  if (subjEl) subjEl.textContent = subjectCount;

  // Grade letter
  let grade = '', gradeColor = '';
  if      (cgpa >= 9.0) { grade = 'O';  gradeColor = '#10b981'; }
  else if (cgpa >= 8.0) { grade = 'A+'; gradeColor = '#06b6d4'; }
  else if (cgpa >= 7.0) { grade = 'A';  gradeColor = '#3b82f6'; }
  else if (cgpa >= 6.0) { grade = 'B+'; gradeColor = '#8b5cf6'; }
  else if (cgpa >= 5.0) { grade = 'B';  gradeColor = '#f59e0b'; }
  else if (cgpa >= 4.0) { grade = 'C';  gradeColor = '#ec4899'; }
  else                  { grade = 'F';  gradeColor = '#ef4444'; }

  if (gradeEl) {
    gradeEl.textContent = grade;
    gradeEl.style.color = gradeColor;
  }

  // Circular progress (circumference = 2π×70 ≈ 440)
  if (circFill) {
    const dashOffset = 440 - (cgpa / 10) * 440;
    circFill.style.strokeDashoffset = dashOffset;
  }

  // Percentage
  if (percentage) {
    const pct = ((cgpa - 0.5) * 10).toFixed(1);
    percentage.textContent = cgpa > 0 ? `~${Math.max(0,pct)}%` : '0%';
  }
}

function clearCGPA() {
  const container = document.getElementById('cgpa-rows');
  if (!container) return;
  container.innerHTML = '';
  rowCount = 0;
  addCGPARow();
  addCGPARow();
  addCGPARow();
  window.showToast && showToast('Calculator cleared!', 'info');
}

function exportCGPA() {
  const cgpa = document.getElementById('cgpa-big-number')?.textContent || '0.00';
  const grade = document.getElementById('cgpa-grade')?.textContent || '-';
  const credits = document.getElementById('cgpa-total-credits')?.textContent || '0';
  const subjects = document.getElementById('cgpa-subject-count')?.textContent || '0';

  const rows = document.querySelectorAll('#cgpa-rows .cgpa-row');
  let details = '';
  rows.forEach((row, i) => {
    const name   = row.querySelectorAll('input')[0]?.value || `Subject ${i+1}`;
    const credit = row.querySelectorAll('input')[1]?.value || '0';
    const grade_ = row.querySelector('select')?.value || '-';
    details += `${name.padEnd(25)} Credits: ${credit}  Grade: ${grade_}\n`;
  });

  const text = `
╔══════════════════════════════════════╗
║     AIML DEPT — CGPA REPORT         ║
╚══════════════════════════════════════╝
CGPA       : ${cgpa}
Grade      : ${grade}
Subjects   : ${subjects}
Total Credits: ${credits}
Approx %   : ${((parseFloat(cgpa)-0.5)*10).toFixed(1)}%

── Subject Breakdown ──
${details}
Generated : ${new Date().toLocaleString()}
`;

  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'CGPA_Report.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  window.showToast && showToast('CGPA report downloaded!', 'success');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Populate initial rows
  ['addCGPARow', 'addCGPARow', 'addCGPARow', 'addCGPARow'].forEach(() => addCGPARow());

  const addBtn  = document.getElementById('cgpa-add-btn');
  const clearBtn = document.getElementById('cgpa-clear-btn');
  const exportBtn = document.getElementById('cgpa-export-btn');

  if (addBtn)    addBtn.addEventListener('click', addCGPARow);
  if (clearBtn)  clearBtn.addEventListener('click', clearCGPA);
  if (exportBtn) exportBtn.addEventListener('click', exportCGPA);
});
