import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.5.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure researcher can register",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const researcher = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('neural-commitment', 'register-researcher', 
                [types.uint(1000), types.bool(false)], 
                researcher.address)
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk();
    }
});

Clarinet.test({
    name: "Validate research proposal creation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const researcher = accounts.get('wallet_1')!;

        // First, register the researcher
        let block = chain.mineBlock([
            Tx.contractCall('neural-commitment', 'register-researcher', 
                [types.uint(1000), types.bool(false)], 
                researcher.address)
        ]);

        // Create a research proposal
        block = chain.mineBlock([
            Tx.contractCall('neural-commitment', 'create-research-proposal', 
                [
                    types.ascii("AI Optimization Research"),
                    types.utf8("Advanced neural network efficiency research"),
                    types.ascii("https://research.example.com/proposal"),
                    types.uint(50000),
                    types.list([
                        { description: types.utf8("Initial research phase"), 
                          amount: types.uint(10000), 
                          completed: types.bool(false), 
                          funded: types.bool(false) 
                        }
                    ])
                ], 
                researcher.address)
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk();
    }
});

Clarinet.test({
    name: "Prevent non-member from creating proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const nonMember = accounts.get('wallet_2')!;

        let block = chain.mineBlock([
            Tx.contractCall('neural-commitment', 'create-research-proposal', 
                [
                    types.ascii("Unauthorized Proposal"),
                    types.utf8("Attempt to create proposal without membership"),
                    types.ascii("https://invalid.research.com"),
                    types.uint(50000),
                    types.list([])
                ], 
                nonMember.address)
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectErr();
    }
});