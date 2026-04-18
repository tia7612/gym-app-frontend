import jsPDF from 'jspdf';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import type { WorkoutSession, User } from '@/types';

// Esporta sessione in PDF
export const exportSessionToPDF = async (
  session: WorkoutSession,
  user: User
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Report Allenamento', 105, 20, { align: 'center' });
    
    // Info utente
    pdf.setFontSize(12);
    pdf.text(`Utente: ${user.firstName} ${user.lastName}`, 20, 40);
    pdf.text(`Data: ${new Date(session.startTime).toLocaleDateString('it-IT')}`, 20, 50);
    pdf.text(`Sessione: ${session.sessionName}`, 20, 60);
    
    if (session.duration) {
      pdf.text(`Durata: ${session.duration} minuti`, 20, 70);
    }
    
    if (session.totalVolume) {
      pdf.text(`Volume totale: ${session.totalVolume.toLocaleString()} kg`, 20, 80);
    }
    
    // Esercizi
    pdf.setFontSize(14);
    pdf.text('Esercizi:', 20, 100);
    
    let y = 115;
    pdf.setFontSize(10);
    
    session.exercises.forEach((exercise, index) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      
      pdf.setFontSize(11);
      pdf.text(`${index + 1}. ${exercise.exerciseName}`, 20, y);
      y += 8;
      
      pdf.setFontSize(9);
      exercise.sets.forEach((set) => {
        pdf.text(
          `   Serie ${set.setNumber}: ${set.weight}kg x ${set.reps} rep${set.reps > 1 ? 's' : ''}${set.rpe ? ` (RPE: ${set.rpe})` : ''}`,
          25,
          y
        );
        y += 5;
      });
      
      y += 5;
    });
    
    // Note
    if (session.notes) {
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFontSize(11);
      pdf.text('Note:', 20, y);
      y += 8;
      pdf.setFontSize(9);
      const splitNotes = pdf.splitTextToSize(session.notes, 170);
      pdf.text(splitNotes, 20, y);
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.text(
      `Generato da Gym Management App - ${new Date().toLocaleDateString('it-IT')}`,
      105,
      290,
      { align: 'center' }
    );
    
    // Download
    pdf.save(`allenamento_${user.lastName}_${new Date(session.startTime).toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Errore esportazione PDF:', error);
    throw new Error('Errore durante l\'esportazione PDF');
  }
};

// Esporta sessioni in CSV
export const exportSessionsToCSV = (sessions: WorkoutSession[], filename: string = 'allenamenti'): void => {
  try {
    // Prepara i dati
    const csvData: any[] = [];
    
    sessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          csvData.push({
            data: new Date(session.startTime).toLocaleDateString('it-IT'),
            sessione: session.sessionName,
            esercizio: exercise.exerciseName,
            serie: set.setNumber,
            peso_kg: set.weight,
            ripetizioni: set.reps,
            rpe: set.rpe || '',
            volume: set.weight * set.reps,
            note: set.notes || '',
          });
        });
      });
    });
    
    // Configurazione CSV
    const csvConfig = mkConfig({
      fieldSeparator: ',',
      decimalSeparator: '.',
      useKeysAsHeaders: true,
      filename: `${filename}_${new Date().toISOString().split('T')[0]}`,
    });
    
    // Genera e scarica
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  } catch (error) {
    console.error('Errore esportazione CSV:', error);
    throw new Error('Errore durante l\'esportazione CSV');
  }
};

// Esporta statistiche in PDF
export const exportStatsToPDF = async (
  stats: any,
  user: User,
  period: string
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Statistiche Allenamento', 105, 20, { align: 'center' });
    
    // Info
    pdf.setFontSize(12);
    pdf.text(`Utente: ${user.firstName} ${user.lastName}`, 20, 40);
    pdf.text(`Periodo: ${period}`, 20, 50);
    pdf.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 20, 60);
    
    // Statistiche generali
    pdf.setFontSize(14);
    pdf.text('Statistiche Generali:', 20, 80);
    
    pdf.setFontSize(11);
    const generalStats = stats.generalStats || {};
    pdf.text(`Totale allenamenti: ${generalStats.totalWorkouts || 0}`, 25, 95);
    pdf.text(`Volume totale: ${(generalStats.totalVolume || 0).toLocaleString()} kg`, 25, 105);
    pdf.text(`Totale serie: ${generalStats.totalSets || 0}`, 25, 115);
    pdf.text(`Durata media: ${Math.round(generalStats.avgDuration || 0)} min`, 25, 125);
    pdf.text(`Livello energia medio: ${(generalStats.avgEnergyLevel || 0).toFixed(1)}/10`, 25, 135);
    
    // Esercizi più frequenti
    pdf.setFontSize(14);
    pdf.text('Esercizi Più Frequenti:', 20, 155);
    
    pdf.setFontSize(10);
    let y = 170;
    const topExercises = stats.topExercises || [];
    topExercises.slice(0, 10).forEach((ex: any, index: number) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(
        `${index + 1}. ${ex.exerciseName} - ${ex.count} volte (${ex.totalVolume.toLocaleString()} kg)`,
        25,
        y
      );
      y += 8;
    });
    
    // Footer
    pdf.setFontSize(8);
    pdf.text(
      'Generato da Gym Management App',
      105,
      290,
      { align: 'center' }
    );
    
    pdf.save(`statistiche_${user.lastName}_${period}.pdf`);
  } catch (error) {
    console.error('Errore esportazione statistiche PDF:', error);
    throw new Error('Errore durante l\'esportazione statistiche');
  }
};

// Formatta data
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Formatta data e ora
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formatta durata
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};
