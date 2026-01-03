"use client";

import { useEffect, useState } from "react";

type Responden = {
  id: number;
  nama: string;
};

type Question = {
  id: number;
  question: string;
};

export default function KuesionerPage() {
  const [responden, setResponden] = useState<Responden[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [respondenId, setRespondenId] = useState("");
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetch("/api/responden")
      .then((res) => res.json())
      .then(setResponden);

    fetch("/api/sus-question")
      .then((res) => res.json())
      .then(setQuestions);
  }, []);

  function handleChange(qid: number, value: number) {
    setAnswers({ ...answers, [qid]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = Object.entries(answers).map(([questionId, score]) => ({
      respondenId: Number(respondenId),
      questionId: Number(questionId),
      score,
    }));

    await fetch("/api/sus-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Kuesioner SUS berhasil disimpan");
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        Kuesioner System Usability Scale (SUS)
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Responden */}
        <div>
          <label className="block mb-1">Responden</label>
          <select
            value={respondenId}
            onChange={(e) => setRespondenId(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">-- Pilih Responden --</option>
            {responden.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Pertanyaan */}
        {questions.map((q, index) => (
          <div key={q.id}>
            <p className="mb-2">
              {index + 1}. {q.question}
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((v) => (
                <label key={v} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={v}
                    onChange={() => handleChange(q.id, v)}
                    required
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Simpan Kuesioner
        </button>
      </form>
    </div>
  );
}
