import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { type UmaSummary, useApi } from "../api";
import { Async } from "../components";

export function UmasPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const [input, setInput] = useState(q);
  const result = useApi<UmaSummary[]>(q ? `/api/umas?q=${encodeURIComponent(q)}` : null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setParams(input.trim() ? { q: input.trim() } : {});
  };

  return (
    <>
      <h1>馬</h1>
      <form onSubmit={submit}>
        <input
          type="search"
          placeholder="馬名(カナ・英字)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />{" "}
        <button type="submit">検索</button>
      </form>
      {q && (
        <Async state={result}>
          {(list) =>
            list.length === 0 ? (
              <p className="muted">見つかりませんでした</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>馬名</th>
                    <th>英字名</th>
                    <th>性</th>
                    <th className="num">生年</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((uma) => (
                    <tr key={uma.id}>
                      <td>
                        <Link to={`/umas/${uma.id}`}>{uma.bamei}</Link>
                      </td>
                      <td>{uma.eigoBamei}</td>
                      <td>{uma.seibetsu}</td>
                      <td className="num">{uma.seinen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </Async>
      )}
    </>
  );
}
