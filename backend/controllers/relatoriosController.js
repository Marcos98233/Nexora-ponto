// Controller de Relatórios - Geração de PDF e Excel
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const pool = require('../config/database');

/**
 * Busca dados de frequência para relatórios.
 */
const buscarDadosRelatorio = async (filtros) => {
  const { funcionario_id, departamento_id, data_inicio, data_fim } = filtros;

  const hoje = new Date().toISOString().split('T')[0];
  const inicio = data_inicio || hoje;
  const fim = data_fim || hoje;

  let query = `
    SELECT
      f.id AS funcionario_id,
      f.nome AS funcionario,
      d.nome AS departamento,
      DATE(r.data_hora) AS data,
      r.tipo,
      TIME(r.data_hora) AS hora
    FROM registros r
    INNER JOIN funcionarios f ON f.id = r.funcionario_id
    INNER JOIN departamentos d ON d.id = f.departamento_id
    WHERE DATE(r.data_hora) BETWEEN ? AND ?
  `;
  const params = [inicio, fim];

  if (funcionario_id) {
    query += ' AND f.id = ?';
    params.push(funcionario_id);
  }
  if (departamento_id) {
    query += ' AND d.id = ?';
    params.push(departamento_id);
  }

  query += ' ORDER BY f.nome, r.data_hora ASC';

  const [registros] = await pool.query(query, params);
  return { registros, inicio, fim };
};

/**
 * Processa registros agrupados por funcionário/data com cálculo de horas.
 */
const processarRegistros = (registros) => {
  const agrupado = {};

  for (const reg of registros) {
    const key = `${reg.funcionario_id}_${reg.data}`;
    if (!agrupado[key]) {
      agrupado[key] = {
        funcionario: reg.funcionario,
        departamento: reg.departamento,
        data: reg.data,
        entradas: [],
        saidas: [],
        horas_trabalhadas: '00:00'
      };
    }
    if (reg.tipo === 'ENTRADA') agrupado[key].entradas.push(reg.hora);
    else agrupado[key].saidas.push(reg.hora);
  }

  // Calcular horas trabalhadas por par entrada/saída
  for (const item of Object.values(agrupado)) {
    let totalMs = 0;
    const pares = Math.min(item.entradas.length, item.saidas.length);
    for (let i = 0; i < pares; i++) {
      const entrada = new Date(`1970-01-01T${item.entradas[i]}`);
      const saida = new Date(`1970-01-01T${item.saidas[i]}`);
      totalMs += Math.max(0, saida - entrada);
    }
    const h = Math.floor(totalMs / 3600000);
    const m = Math.floor((totalMs % 3600000) / 60000);
    item.horas_trabalhadas = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return Object.values(agrupado).sort((a, b) =>
    a.funcionario.localeCompare(b.funcionario) || a.data.localeCompare(b.data)
  );
};

/**
 * GET /api/relatorios/pdf
 * Gera relatório em PDF.
 */
const gerarPDF = async (req, res, next) => {
  try {
    const { registros, inicio, fim } = await buscarDadosRelatorio(req.query);
    const dados = processarRegistros(registros);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-frequencia-${inicio}-${fim}.pdf"`);
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(18).font('Helvetica-Bold').text('RELATÓRIO DE FREQUÊNCIA', { align: 'center' });
    doc.fontSize(11).font('Helvetica').text(
      `Período: ${new Date(inicio + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(fim + 'T12:00:00').toLocaleDateString('pt-BR')}`,
      { align: 'center' }
    );
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.5);

    if (dados.length === 0) {
      doc.text('Nenhum registro encontrado para o período selecionado.', { align: 'center' });
      doc.end();
      return;
    }

    // Cabeçalho da tabela
    const colWidths = [150, 90, 80, 80, 80, 80];
    const headers = ['Funcionário', 'Departamento', 'Data', 'Entrada(s)', 'Saída(s)', 'Horas'];
    const startX = 40;
    let y = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((h, i) => {
      doc.text(h, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });

    doc.moveTo(40, y + 14).lineTo(560, y + 14).stroke();
    y += 18;

    // Linhas de dados
    doc.font('Helvetica').fontSize(8);
    for (const item of dados) {
      if (y > 740) {
        doc.addPage();
        y = 40;
      }
      x = startX;
      const linha = [
        item.funcionario,
        item.departamento,
        new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR'),
        item.entradas.join(' / ') || '-',
        item.saidas.join(' / ') || '-',
        item.horas_trabalhadas
      ];
      linha.forEach((val, i) => {
        doc.text(val, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += 14;
    }

    // Rodapé
    doc.moveTo(40, y + 5).lineTo(560, y + 5).stroke();
    doc.fontSize(8).text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')} | Total de registros: ${dados.length}`,
      40, y + 10
    );

    doc.end();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/relatorios/excel
 * Gera relatório em Excel.
 */
const gerarExcel = async (req, res, next) => {
  try {
    const { registros, inicio, fim } = await buscarDadosRelatorio(req.query);
    const dados = processarRegistros(registros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Controle de Frequência';
    const sheet = workbook.addWorksheet('Frequência');

    // Estilo do cabeçalho
    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = 'RELATÓRIO DE FREQUÊNCIA';
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.mergeCells('A2:F2');
    sheet.getCell('A2').value = `Período: ${new Date(inicio + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(fim + 'T12:00:00').toLocaleDateString('pt-BR')}`;
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    // Cabeçalhos das colunas
    const headerRow = sheet.addRow(['Funcionário', 'Departamento', 'Data', 'Entrada(s)', 'Saída(s)', 'Horas Trabalhadas']);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Dados
    for (const item of dados) {
      const row = sheet.addRow([
        item.funcionario,
        item.departamento,
        new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR'),
        item.entradas.join(' / ') || '-',
        item.saidas.join(' / ') || '-',
        item.horas_trabalhadas
      ]);
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    }

    // Ajustar largura das colunas
    sheet.columns = [
      { width: 30 }, { width: 20 }, { width: 12 },
      { width: 20 }, { width: 20 }, { width: 18 }
    ];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-frequencia-${inicio}-${fim}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { gerarPDF, gerarExcel };
