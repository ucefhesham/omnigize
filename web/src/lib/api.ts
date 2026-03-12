const GRAPHQL_URL = 'http://localhost:3001/graphql';

export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, any> = {},
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    ...options,
  });

  const { data, errors } = await response.json();

  if (errors) {
    console.error('GraphQL Errors:', errors);
    throw new Error(errors[0]?.message || 'GraphQL Request Failed');
  }

  return data as T;
}
