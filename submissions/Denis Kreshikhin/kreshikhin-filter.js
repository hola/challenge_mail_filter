const ASTERIX_CODE = '*'.charCodeAt(0);
const QUESTION_MARK_CODE = '?'.charCodeAt(0);

function createRegExpByWildcard(wildcard){
    return new RegExp('^' + wildcard.
        replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&"). // except \* and \?
        replace(/\*/g, '.*').
        replace(/\?/g, '.') + '$');
}

var BruteForce = function(messages, rules){
    var compiled_rules = [];
    for(var i = 0; i < rules.length; i++){
        var rule = rules[i];
        var compiled = {a: rule.action};

        compiled.f = createRegExpByWildcard(rule.from || '*');
        compiled.t = createRegExpByWildcard(rule.to || '*');

        compiled_rules.push(compiled);
    }

    var result = {};

    for(var k in messages){
        var message = messages[k];
        var actions = [];

        for(var i = 0; i < compiled_rules.length; i++){
            var rule = compiled_rules[i];
            if(rule.f.test(message.from) && rule.t.test(message.to)){
                actions.push(rule.a);
            }
        }

        result[k] = actions;
    }

    return result;
};

function Predictor(){
    var self = this;

    var in_decoder;
    var out_decoder;

    var in_encoder;
    var out_encoder;

    var predictionSize = 4;

    var predictions = [];

    function detectIndexOfMaxElement(elements){
        var value = -Infinity;
        var index;
        for(var i = 0; i < elements.length; i++){
            if(elements[i] <= value) continue;
            value = elements[i];
            index = i;
        }
        return index;
    }

    function GetInfoPerBit(codes){
        var counts = new Int32Array(32);

        for(var i = 0; i < codes.length; i++){
            var code = codes[i];
            for(var j = 0; j < 32; j++){
                counts[j] += code & 1;
                code >>= 1;
            }
        }

        var info = new Float64Array(counts.length);

        for(var i = 0; i < counts.length; i++){
            var p1 = counts[i] / codes.length;
            var p0 = 1 - p1;

            if(p1 === 0 || p0 === 0) {
                info[i] = 0;
                continue;
            }

            info[i] =  - (p0*Math.log(p0) + p1*Math.log(p1)) / Math.log(2);
        }

        return info;
    }

    function GetMutualInfo(codes, sources, destination){
        var destionationProbability = new Float64Array(2);
        var sourceProbability = new Float64Array(Math.pow(2, sources.length));
        var pairwaiseProbability = new Float64Array(Math.pow(2, 1 + sources.length));

        for(var i = 0; i < codes.length; i++){
            var code = codes[i];
            var destionationValue = (code >> destination) & 1;

            destionationProbability[1] += destionationValue;

            var argument = 0;
            for(var j = 0; j < sources.length; j++){
                var position = sources[j];
                var value = (code >> position) & 1;
                argument |= value;
                argument <<= 1;
            }
            argument |= destionationValue;
            pairwaiseProbability[argument] += 1;
            sourceProbability[argument >> 1] += 1;
        }

        destionationProbability[1] /= codes.length;
        destionationProbability[0] = 1 - destionationProbability[1];

        for(var i = 0; i < pairwaiseProbability.length; i ++){
            pairwaiseProbability[i] /= codes.length;
        }

        for(var i = 0; i < sourceProbability.length; i ++){
            sourceProbability[i] /= codes.length;
        }

        var information = 0;
        for(var i = 0; i < pairwaiseProbability.length; i ++){
            var pij = pairwaiseProbability[i];
            var pi = destionationProbability[i & 1];
            var pj = sourceProbability[i >> 1];
            if(pij == 0 || pi == 0 || pj == 0) continue;
            information += pij * Math.log(pij/(pi * pj));
        }

        information /= Math.log(2);

        return information;
    }

    self.collectMostInformativeBits = function(codes, n){
        var bitInfo = GetInfoPerBit(codes);
        var maxInformativeBit = detectIndexOfMaxElement(bitInfo);

        for(var bits = [maxInformativeBit]; bits.length < n; bits.push(maxInformativeBit)){
            var ownInfoPerBits = [];
            for(var i = 0; i < bitInfo.length; i ++){
                ownInfoPerBits.push(bitInfo[i] - GetMutualInfo(codes, bits, i));
            }

            maxInformativeBit = detectIndexOfMaxElement(ownInfoPerBits);
        }

        return bits;
    }

    self.buildEncoder = function(bits){
        var positions = bits.slice();
        return function(source){
            var result = 0;
            for(var i = 0; i < positions.length; i++){
                var b = (source >> positions[i]) & 1;
                result |= (b << i);
            }
            return result;
        }
    }

    self.buildDecoder = function(bits){
        var positions = bits.slice();
        return function(source){
            var result = 0xFFFFFFFF;
            for(var i = 0; i < positions.length; i++){
                var bit = ((source >> i) & 1);
                if(bit) continue;
                result &= ~(1 << positions[i]);
            }
            return result;
        }
    }

    self.learn = function(in_masks, out_masks){
        predictions = [];

        var in_bits = self.collectMostInformativeBits(in_masks, predictionSize);
        var out_bits = self.collectMostInformativeBits(out_masks, predictionSize);

        in_encoder = self.buildEncoder(in_bits);
        out_encoder = self.buildEncoder(out_bits);

        in_decoder = self.buildDecoder(in_bits);
        out_decoder = self.buildDecoder(out_bits);

        var l = 1 << 2*predictionSize;
        for(var i = 0; i < l; i++){
            var in_submask = in_decoder(i >> predictionSize);
            var out_submask = out_decoder(i & (Math.pow(2, predictionSize) - 1));

            var in_candidates = [];
            var out_candidates = [];

            for(var j = 0; j < in_masks.length; j++){
                if(in_masks[j] & ~in_submask) continue;
                in_candidates.push(j);
            }

            for(var j = 0; j < out_masks.length; j++){
                if(out_masks[j] & ~out_submask) continue;
                out_candidates.push(j);
            }

            var candidates = [];
            for(var u = 0, v = 0; (u < in_candidates.length) && (v < out_candidates.length);){
                if(in_candidates[u] === out_candidates[v]){
                    candidates.push(in_candidates[u])
                    u++; v++;
                    continue;
                }

                if(in_candidates[u] > out_candidates[v]){
                    v++;
                }else{
                    u++;
                }
            }

            predictions.push(candidates);
        }
    }

    self.predictActions = function(in_code, out_code){
        var subcode = (in_encoder(in_code) << predictionSize) | out_encoder(out_code);
        return predictions[subcode];
    }
};

function Dispatcher(masks){
    var self = this;
    var predictor = false;

    var in_masks = [];
    var in_patterns = [];

    var out_masks = [];
    var out_patterns = [];

    var actions = [];

    var register = function(wildcard, masks, patterns){
        var m = 0;
        var overall = true;
        for(var i = 0; i < wildcard.length; i ++){
            var ch = wildcard.charCodeAt(i);
            if(ch == ASTERIX_CODE) continue;
            if(ch == QUESTION_MARK_CODE) {
                overall = false;
                continue;
            }

            m |= (1 << ch);
        }

        if((m === 0) && overall){
            patterns.push(null);
            masks.push(0);
            return;
        }

        patterns.push(createRegExpByWildcard(wildcard));
        masks.push(m);
    }

    self.find = function(in_address, out_address){
        var in_code = 0;
        for(var i = 0; i < in_address.length; i ++){
            in_code |= (1 << in_address.charCodeAt(i));
        }

        var out_code = 0;
        for(var i = 0; i < out_address.length; i ++){
            out_code |= (1 << out_address.charCodeAt(i));
        }

        var result = [];

        var predictedActions = actions;
        if(predictor){
            predictedActions = predictor.predictActions(in_code, out_code);
        };

        for(var i = 0; i < predictedActions.length; i ++){
            var j = i;
            if(predictor){
                j = predictedActions[i];
            }

            var inp = in_patterns[j];
            var outp = out_patterns[j];

            if(inp === null && outp === null){
                result.push(actions[j]);
                continue;
            };

            if(inp === null){
                if(out_masks[j] & ~out_code) continue;
                if(outp.test(out_address)) result.push(actions[j]);
                continue;
            };

            if(outp === null){
                if(in_masks[j] & ~in_code) continue;
                if(inp.test(in_address)) result.push(actions[j]);
                continue;
            };

            if(out_masks[j] & ~out_code) continue;
            if(in_masks[j] & ~in_code) continue;

            if(outp.test(out_address) && inp.test(in_address)){
                result.push(actions[j]);
            };
        }

        return result;
    }

    self.enablePrediction = function(){
        predictor = new Predictor();
        predictor.learn(in_masks, out_masks);
    }

    for(var i = 0; i < masks.length; i++){
        var mask = masks[i];
        register(mask.from || '', in_masks, in_patterns);
        register(mask.to || '', out_masks, out_patterns);
        actions.push(mask.action);
    }
}

var OptimizedSearch = function(letters, masks){
    var dispatcher = new Dispatcher(masks);
    var result = {};
    for(var k in letters){
        result[k] = dispatcher.find(letters[k].from, letters[k].to);
    }
    return result;
};

var PredictedOptimizedSearch = function(letters, masks){
    var dispatcher = new Dispatcher(masks);
    dispatcher.enablePrediction();
    var result = {};
    for(var k in letters){
        result[k] = dispatcher.find(letters[k].from, letters[k].to);
    }
    return result;
};

function filter(messages, rules){
    var algs = [];

    algs.push({ranges: [
        [8, +Infinity],
        [16, 256],
        [32, 32],
        [128, 16],
        [256, 8]
    ], fn: BruteForce});

    algs.push({ranges: [
        [1000, 10000],
        [10000, 1000]
    ], fn: OptimizedSearch})

    var msgCount = Object.keys(messages).length;
    var ruleCount = rules.length;

    for(var i = 0; i < algs.length; i++){
        var alg = algs[i];
        for(var j = 0; j < alg.ranges.length; j++){
            var range = alg.ranges[j];
            if(ruleCount < range[0] && msgCount < range[1]){
                return alg.fn(messages, rules);
            }
        }
    }

    return PredictedOptimizedSearch(messages, rules);
};

module.exports = {
    filter: filter
};
