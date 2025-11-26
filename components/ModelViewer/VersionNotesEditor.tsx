// components/ModelViewer/VersionNotesEditor.tsx
"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface VersionNotesEditorProps {
  versionId: number;
  currentNotes: string;
  onSave?: (newNotes: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function VersionNotesEditor({
  versionId,
  currentNotes,
  onSave,
  onCancel,
  className = "",
}: VersionNotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = supabaseBrowser();

  const handleStartEdit = () => {
    setIsEditing(true);
    setNotes(currentNotes);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNotes(currentNotes);
    setError(null);
    onCancel?.();
  };

  const handleSave = async () => {
    if (!notes.trim()) {
      setError("Las notas no pueden estar vacías");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Primero verificamos que exista exactamente una versión con este ID
      const { data: checkData, error: checkError } = await supabase
        .from("modelos_versiones")
        .select("id")
        .eq("id", versionId);

      if (checkError) throw checkError;

      if (!checkData || checkData.length === 0) {
        throw new Error("No se encontró la versión especificada");
      }

      if (checkData.length > 1) {
        throw new Error("Se encontraron múltiples versiones con el mismo ID");
      }

      // Ahora actualizamos sin usar .single()
      const { error: updateError } = await supabase
        .from("modelos_versiones")
        .update({
          notas: notes.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(versionId));

      if (updateError) throw updateError;

      setIsEditing(false);
      onSave?.(notes.trim());

      // Mostrar mensaje de éxito
      alert("✅ Notas actualizadas correctamente");
    } catch (err: any) {
      console.error("Error updating notes:", err);
      setError(err.message || "Error al guardar las notas");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  // Versión alternativa más simple sin verificación previa
  const handleSaveSimple = async () => {
    if (!notes.trim()) {
      setError("Las notas no pueden estar vacías");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Enfoque simple: solo actualizar sin verificar ni seleccionar datos de retorno
      const { error: updateError } = await supabase
        .from("modelos_versiones")
        .update({
          notas: notes.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", versionId);

      if (updateError) throw updateError;

      setIsEditing(false);
      onSave?.(notes.trim());

      // Mostrar mensaje de éxito
      alert("✅ Notas actualizadas correctamente");
    } catch (err: any) {
      console.error("Error updating notes:", err);
      setError(err.message || "Error al guardar las notas");
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-between items-start mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Notas de la Versión
          </label>
          <button
            onClick={handleStartEdit}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            ✏️ Editar
          </button>
        </div>
        <div
          className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-300 cursor-pointer min-h-[80px]"
          onClick={handleStartEdit}
        >
          {currentNotes || (
            <span className="text-gray-400 italic">
              Haz click para agregar notas sobre esta versión...
            </span>
          )}
        </div>
        {!currentNotes && (
          <p className="text-xs text-gray-500 mt-1">
            Las notas ayudan a documentar los cambios en cada versión
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Editando Notas
        </label>
        <div className="flex space-x-1">
          <button
            onClick={handleSaveSimple} // Usamos la versión simple
            disabled={saving}
            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "💾 Guardando..." : "✅ Guardar"}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❌ Cancelar
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe los cambios, mejoras o características de esta versión..."
        className="w-full text-sm text-gray-900 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[120px]"
        autoFocus
        disabled={saving}
        maxLength={500}
      />

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ❌ {error}
        </div>
      )}

      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <div>
          💡 <strong>Tip:</strong> Usa Ctrl+Enter para guardar rápidamente
        </div>
        <div>{notes.length}/500 caracteres</div>
      </div>
    </div>
  );
}
