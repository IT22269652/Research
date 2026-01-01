"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/interview/${id}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-5">Interview Questions</h1>
      <ol className="list-decimal ml-6 space-y-2">
        {data.questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ol>
    </div>
  );
}
