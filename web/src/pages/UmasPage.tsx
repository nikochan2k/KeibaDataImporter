import { Link } from "react-router";
import { type UmaSummary, useApi } from "../api";
import { Async } from "../components";
import { useIncrementalSearch } from "../useIncrementalSearch";

export function UmasPage() {
  const { q, inputProps } = useIncrementalSearch();
  const result = useApi<UmaSummary[]>(q ? `/api/umas?q=${encodeURIComponent(q)}` : null);

  return (
    <div className="fill">
      <h1>馬</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="馬名の先頭(カナ・英字)"
          {...inputProps}
        />{" "}
        <span className="muted">前方一致(入力した文字で始まる馬名)</span>
      </form>
      {q && (
        <Async state={result}>
          {(list) =>
            list.length === 0 ? (
              <p className="muted">見つかりませんでした</p>
            ) : (
              <div className="scroll">
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
              </div>
            )
          }
        </Async>
      )}
    </div>
  );
}
