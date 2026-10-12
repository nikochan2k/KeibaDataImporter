import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { type KishuSummary, useApi } from "../api";
import { Async } from "../components";

export function KishusPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const [input, setInput] = useState(q);
  const result = useApi<KishuSummary[]>(q ? `/api/kishus?q=${encodeURIComponent(q)}` : null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setParams(input.trim() ? { q: input.trim() } : {});
  };

  return (
    <>
      <h1>騎手</h1>
      <form onSubmit={submit}>
        <input
          type="search"
          placeholder="騎手名の先頭(姓名・略称・フリガナ)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />{" "}
        <button type="submit">検索</button>{" "}
        <span className="muted">前方一致(入力した文字で始まる名前)</span>
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
                    <th>騎手名</th>
                    <th>性</th>
                    <th>所属</th>
                    <th className="num">生年</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((kishu) => (
                    <tr key={kishu.id}>
                      <td>
                        <Link to={`/kishus/${kishu.id}`}>{kishu.meishou}</Link>
                      </td>
                      <td>{kishu.seibetsu}</td>
                      <td>{kishu.shozoku}</td>
                      <td className="num">{kishu.seinen}</td>
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
